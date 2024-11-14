import { zodResolver } from "@hookform/resolvers/zod";
import {
  RegisterPageProps,
  useActiveAuthProvider,
  useLink,
  useRegister,
  useRouterContext,
  useRouterType,
  useTranslate,
} from "@refinedev/core";
import { ChevronLeft, ChevronRight, Loader2, Lock, Mail } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Checkbox } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type DivPropsType = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
type FormPropsType = React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>;

type RegisterProps = RegisterPageProps<
  DivPropsType,
  DivPropsType,
  FormPropsType
>;

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone_number: z.string()
    .min(9, "Phone number must be 9 digits")
    .max(9, "Phone number must be 9 digits")
    .regex(/^\d+$/, "Please enter only numbers"),
  affiliation: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const steps = [
  { id: 1, title: "Account", description: "Create your login credentials" },
  { id: 2, title: "Personal", description: "Your personal information" },
  { id: 3, title: "Additional", description: "Optional information" },
  { id: 4, title: "Review", description: "Review and confirm registration" },
];

const stepFields = {
  1: ["email", "password", "confirmPassword"],
  2: ["firstName", "lastName", "phone_number"],
  3: ["affiliation"],
  4: [],
} as const;

export const RegisterPage: React.FC<RegisterProps> = ({
  providers,
  loginLink,
  wrapperProps,
  contentProps,
  renderContent,
  formProps,
  title = undefined,
  hideForm,
}) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isReviewConfirmed, setIsReviewConfirmed] = React.useState(false);
  const routerType = useRouterType();
  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();
  const ActiveLink = routerType === "legacy" ? LegacyLink : Link;
  const translate = useTranslate();

  const authProvider = useActiveAuthProvider();
  const { mutate: register, isLoading } = useRegister({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      middleName: "",
      lastName: "",
      phone_number: "",
      affiliation: "",
    },
  });

  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 9);
    onChange(value);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { confirmPassword, firstName, middleName, lastName, phone_number, ...rest } = values;

    toast.promise(
      (async () => {
        // Artificial delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        return register({
          ...rest,
          name: `${firstName} ${middleName ? `${middleName} ` : ''}${lastName}`.trim(),
          phone_number: `+639${phone_number}`,
        });
      })(),
      {
        loading: 'Creating your account...',
        success: 'Account created successfully!',
        error: 'Failed to create account. Please try again.',
      }
    );
  };

  const nextStep = async (e: React.MouseEvent) => {
    // Prevent default to avoid form submission
    e.preventDefault();

    const fieldsToValidate = stepFields[currentStep as keyof typeof stepFields];
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      // If moving to review step, validate all fields first
      if (currentStep === steps.length - 1) {
        const allValid = await form.trigger();
        if (!allValid) return;
      }

      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const validateAllFields = async () => {
    const allFieldsValid = await form.trigger();
    return allFieldsValid;
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("pages.register.fields.email", "Email")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                      <Input type="email" className="pl-10" required {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("pages.register.fields.password", "Password")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                      <Input type="password" className="pl-10" required {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                      <Input type="password" className="pl-10" required {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case 2:
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute -translate-y-1/2 left-3 top-1/2 text-muted-foreground">+639</span>
                      <Input
                        required
                        className="pl-12"
                        onChange={(e) => handlePhoneNumberChange(e, field.onChange)}
                        value={field.value}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case 3:
        return (
          <FormField
            control={form.control}
            name="affiliation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Affiliation</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 4: {
        const formValues = form.getValues();
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Review Your Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {formValues.email}</p>
                <p><strong>Name:</strong> {`${formValues.firstName} ${formValues.middleName ? `${formValues.middleName} ` : ''}${formValues.lastName}`.trim()}</p>
                <p><strong>Phone:</strong> {`+639${formValues.phone_number}`}</p>
                <p><strong>Affiliation:</strong> {formValues.affiliation || "Not provided"}</p>
              </div>
            </div>
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={isReviewConfirmed}
                  onCheckedChange={(checked) => setIsReviewConfirmed(checked as boolean)}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">
                I confirm that all the information provided is correct
              </FormLabel>
            </FormItem>
          </div>
        );
      }
    }
  };

  const renderLink = (link: string, text?: string) => {
    return <ActiveLink to={link}>{text}</ActiveLink>;
  };

  const renderProviders = () => {
    if (providers) {
      return providers.map((provider) => (
        <Button
          key={provider.name}
          type="button"
          variant="outline"
          className="w-full mb-2"
          onClick={() => register({ providerName: provider.name })}
        >
          {provider?.icon}
          {provider.label}
        </Button>
      ));
    }
    return null;
  };

  const content = (
    <Card className="w-full max-w-lg shadow-lg" {...contentProps}>
      <CardHeader className="space-y-2">
        <div className="space-y-1">
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </div>
        <div className="flex space-x-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`h-2 flex-1 rounded-full ${step.id <= currentStep ? "bg-primary" : "bg-muted"
                }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {renderProviders() && (
          <>
            <div className="space-y-4">
              {renderProviders()}
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-background text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
          </>
        )}
        {!hideForm && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} {...formProps} className="space-y-4">
              {renderCurrentStep()}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                {currentStep === steps.length ? (
                  <Button
                    type="submit"
                    disabled={isLoading || !isReviewConfirmed}
                    onClick={async (e) => {
                      e.preventDefault();
                      const isValid = await validateAllFields();
                      if (isValid) {
                        try {
                          await form.handleSubmit(onSubmit)(e);
                        } catch (error) {
                          // Error will be handled by toast
                        }
                      }
                    }}
                  >
                    {(isLoading) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Complete Registration
                  </Button>
                ) : (
                  <Button type="button" onClick={(e) => nextStep(e)}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex flex-row justify-center text-center">
        <div className="text-sm text-muted-foreground">
          {translate("pages.login.buttons.haveAccount", "Already have an account?")}{" "}
          <Button variant="link" className="px-0" asChild>
            {renderLink("/login", translate("pages.login.signin", "Sign in"))}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div {...wrapperProps}>
      {renderContent ? renderContent(content, title) : content}
    </div>
  );
};
