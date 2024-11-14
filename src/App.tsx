import {
  Authenticated,
  ErrorComponent,
  Refine
} from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { Building, CalendarCheck2, MapPin, Send, X } from "lucide-react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import Page from "./app/dashboard/page";
import authProvider from "./authProvider";
import { AuthPage } from "./components/pages/auth";
import { SidebarProvider } from "./components/ui/sidebar";
import { Toaster } from "./components/ui/sonner";
import { ApprovedList } from "./pages/users/approved";
import { BookVenuePage } from "./pages/users/book";
import { DeclinedList } from "./pages/users/declined";
import { LogsPage } from "./pages/users/logs";
import { ProfileShow } from "./pages/users/profiles";
import { UpdatesPage } from "./pages/users/updates";
import { VenuePage } from "./pages/users/venues/page";
import { RequestedList, RequestedShow } from "./pages/users/vw_bookers";
import { supabaseClient } from "./utility";

function App() {
  return (
    (<BrowserRouter>
      <RefineKbarProvider>
        <SidebarProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider(supabaseClient)}
              liveProvider={liveProvider(supabaseClient)}
              authProvider={authProvider}
              routerProvider={routerBindings}
              resources={[{
                name: "venues",
                list: "/venues/list",
                meta: {
                  label: "Venues",
                  icon: <Building className="w-5 h-5" />
                }
              }, {
                name: "bookings",
                create: "/book/venue/:id",
                identifier: "book",
                meta: {
                  hide: true,
                }
              }, {
                name: "vw_booker",
                list: "/booked/all",
                show: "/book/show/:id",
                identifier: "booked",
                meta: {
                  label: "Pending",
                  icon: <Send className="w-5 h-5" />
                }
              }, {
                name: "vw_user_approved",
                list: "/approved",
                show: "/book/show/:id",
                meta: {
                  label: "Approved",
                  icon: <CalendarCheck2 className="w-5 h-5" />
                }
              }, {
                name: "vw_user_deleted",
                list: "/declined",
                show: "/book/show/:id",
                meta: {
                  label: "Declined",
                  icon: <X className="w-5 h-5" />
                }
              }, {
                name: "profiles",
                list: "/profiles",
                create: "/profiles/create",
                edit: "/profiles/edit/:id",
                show: "/profiles/show/:id",
                meta: {
                  hide: true
                }
              }, {
                name: "updates",
                list: "/updates",
                meta: {
                  hide: true
                }
              }, {
                name: "settings",
                list: "/settings",
              }, {
                name: "logs",
                list: "/logs",
              }
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
                projectId: "s3o21H-MJUOEU-Wx2QQd",
              }}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-inner"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <Outlet />
                    </Authenticated>
                  }
                >
                  <Route
                    index
                    element={<NavigateToResource resource="venues" />}
                  />
                  <Route element={<Page><Outlet /></Page>}>
                    <Route path="venues" element={<Outlet />}>
                      <Route path="list" element={<VenuePage />} />
                    </Route>
                    <Route path="booked" element={<Outlet />}>
                      <Route path="all" element={<RequestedList />} />
                    </Route>
                    <Route path="approved" element={<Outlet />}>
                      <Route index element={<ApprovedList />} />
                      <Route path="show/:id" element={<RequestedShow />} />
                    </Route>
                    <Route path="declined" element={<Outlet />}>
                      <Route index element={<DeclinedList />} />
                    </Route>
                    <Route path="settings" element={<Outlet />}>
                      <Route index element={<ProfileShow />} />
                    </Route>
                    <Route path="logs" element={<Outlet />}>
                      <Route index element={<LogsPage />} />
                    </Route>
                    <Route path="updates" element={<Outlet />}>
                      <Route index element={<UpdatesPage />} />
                    </Route>
                    <Route path="/book" element={<Outlet />}>
                      <Route path="venue/:id" element={<BookVenuePage />} />
                      <Route path="*" element={<ErrorComponent />} />
                      <Route path="show/:id" element={<RequestedShow />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                </Route>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-outer"
                      fallback={<Outlet />}
                    >
                      <NavigateToResource />
                    </Authenticated>
                  }
                >
                  <Route
                    path="/login"
                    element={
                      <AuthPage
                        type="login"
                        renderContent={(content) => (
                          <div className="flex items-center justify-center w-screen h-screen">
                            <div className="flex flex-col items-center justify-center w-full space-y-8">
                              <div className="flex flex-col items-center justify-center w-full space-y-2 text-2xl font-medium">
                                <MapPin className="w-16 h-16" absoluteStrokeWidth strokeWidth={1} />
                                <h1>
                                  JHCSC Venue
                                </h1>
                              </div>
                              {content}
                            </div>
                          </div>
                        )}
                      />
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <AuthPage
                        type="register"
                        renderContent={(content) => (
                          <div className="flex items-center justify-center w-screen h-screen">
                            <div className="flex flex-col items-center justify-center w-full space-y-8">
                              <div className="flex flex-col items-center justify-center space-y-2 text-2xl font-medium">
                                <MapPin className="w-16 h-16" absoluteStrokeWidth strokeWidth={1} />
                                <h1>
                                  JHCSC Venue
                                </h1>
                              </div>
                              {content}
                            </div>
                          </div>
                        )}
                      />
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={<AuthPage type="forgotPassword" />}
                  />
                </Route>
              </Routes>
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <Toaster />
            <DevtoolsPanel />
          </DevtoolsProvider>
        </SidebarProvider>
      </RefineKbarProvider>
    </BrowserRouter>)
  );
}

export default App;
