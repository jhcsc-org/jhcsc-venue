import { zodResolver } from "@hookform/resolvers/zod";
import {
  LoginFormTypes,
  LoginPageProps,
  useActiveAuthProvider,
  useLink,
  useLogin,
  useRouterContext,
  useRouterType,
  useTranslate,
} from "@refinedev/core";
import { Loader2, Lock, Mail } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

type LoginProps = LoginPageProps<DivPropsType, DivPropsType, FormPropsType>;

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

export const LoginPage: React.FC<LoginProps> = ({
  providers,
  registerLink,
  forgotPasswordLink,
  rememberMe,
  contentProps,
  wrapperProps,
  renderContent,
  formProps,
  title = undefined,
  hideForm,
}) => {
  const routerType = useRouterType();
  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();

  const ActiveLink = routerType === "legacy" ? LegacyLink : Link;

  const translate = useTranslate();

  const authProvider = useActiveAuthProvider();
  const { mutate: login } = useLogin<LoginFormTypes>({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    login(values);
  }

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
          onClick={() => login({ providerName: provider.name })}
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
        <CardTitle>
          {translate("pages.login.title", "Login")}
        </CardTitle>
        <CardDescription className="text-muted-foreground">Please sign in to continue</CardDescription>
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
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translate("pages.login.fields.email", "Email")}</FormLabel>
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
                    <FormLabel>{translate("pages.login.fields.password", "Password")}</FormLabel>
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
              {rememberMe && (
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="leading-none">
                        <FormLabel className="font-normal">
                          {translate("pages.login.buttons.rememberMe", "Remember me")}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {translate("pages.login.signin", "Sign in")}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-center">
        {forgotPasswordLink && (
          <Button variant="link" className="px-0" asChild>
            {renderLink(
              "/forgot-password",
              translate("pages.login.buttons.forgotPassword", "Forgot password?")
            )}
          </Button>
        )}
        <div className="text-sm text-muted-foreground">
          {translate("pages.login.buttons.noAccount", "Don't have an account?")}{" "}
          <Button variant="link" className="px-0" asChild>
            {renderLink("/register", translate("pages.login.register", "Sign up"))}
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
