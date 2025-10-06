import { Routes, Route, Outlet } from "react-router-dom";

// Pages
import NotFound from "../pages/NotFound";

// Layouts
import MainLayout from "../layout/MainLayout";

import LandingPage from "@/src/pages/LandingPage";
import About from "../pages/About";

import BusinessPortalLogin from "../features/auth/BusinessPortalLogin";
import BusinessPortalRegister from "../features/auth/BusinessPortalRegister";
import AdminLogin from "../features/auth/AdminLogin";
import AdminRegister from "../features/auth/AdminRegister";
import UnifiedLogin from "@/src/features/auth/UnifiedLogin";
import BusinessLayout from "../layout/BusinessLayout";
import MyBusiness from "../features/business/listing/MyBusiness";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import BusinessRegistration from "../features/business/listing/BusinessRegistration";
import BusinessManagementLayout from "../layout/BusinessManagementLayout";
import Transactions from "../features/business/accommodation/transaction/Transactions";
import Bookings from "../features/business/accommodation/bookings/Bookings";
import { RoomProvider } from "../context/RoomContext";
import BusinessProfile from "../features/business/accommodation/business-profile/BusinessProfile";
import ManagePromotion from "../features/business/accommodation/promotion/ManagePromotion";
import RoomPage from "../features/business/accommodation/room/Room";
import RoomProfile from "../features/business/accommodation/room/RoomProfile";
import Profile from "../features/business/profile/Profile";
import Offer from "../features/business/shop/offers/Offer";
import Products from "../features/business/shop/store/Products";
import Orders from "../features/business/shop/store/Orders";
import Discount from "../features/business/shop/store/Discount";
import Settings from "../features/business/shop/store/Settings";

import AccommodationDashboard from "../features/business/accommodation/dashboard/Dashboard";
import ShopDashboard from "../features/business/shop/dashboard/Dashboard";
import ManageShop from "../features/business/shop/manage-business/ManageBusiness";
import AdminLayout from "../layout/AdminLayout";
import Room from "../features/admin/services/accommodation/Room";
import Reviews from "../features/business/accommodation/reviews/Reviews";

// Tourism
import Dashboard from "@/src/features/admin/dashboard/Dashboard";
import Approval from "@/src/features/admin/approval/Approval";
import Report from "@/src/features/admin/report/Report";
import Accommodation from "@/src/features/admin/services/accommodation/Accommodation";
import Shop from "@/src/features/admin/services/shop/Shop";
import Event from "@/src/features/admin/services/event/Event";
import Spot from "@/src/features/admin/services/tourist-spot/Spot";
import TouristSpotDetailsScreen from "@/src/features/admin/services/tourist-spot/TouristSpotDetailsScreen";
import OfferAdmin from "@/src/features/admin/services/shop/Offer";
import { BusinessProvider } from "../context/BusinessContext";
import ReportDetailsScreen from "@/src/features/admin/report/ReportDetailsScreen";
import OneColumnLayout from "../layout/OneColumnLayout";
import { TestPage } from "../test/Test";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import { TestPage3 } from "../test/Test3";
import { TestPage2 } from "../test/Test2";

export default function AppRoutes() {
  const user = "/";
  const business = "/business";
  const tourism = "/tourism";
  const business_type = "Accommodation";

  return (
    <Routes>
      <Route
        element={
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        }
      >
        <Route path="/test/one-column" element={<TestPage />} />
        <Route path="/test/two-column" element={<TestPage2 />} />
        <Route path="/test/three-column" element={<TestPage3 />} />
        {/* Auth routes */}
        <Route element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path={`${user}`} element={<LandingPage />} />
          <Route path={`${user}about`} element={<About />} />
        </Route>
        <Route path={`/login`} element={<UnifiedLogin />} />
        <Route path={`${business}/login`} element={<BusinessPortalLogin />} />
        <Route
          path={`${business}/signup`}
          element={<BusinessPortalRegister />}
        />
        // tourism routes
        <Route path={`${tourism}/login`} element={<AdminLogin />} />
        <Route path={`${tourism}/signup`} element={<AdminRegister />} />
        <Route
          element={
            <BusinessProvider>
              <Outlet />
            </BusinessProvider>
          }
        >
          <Route element={<BusinessLayout />}>
            <Route
              path={`${business}`}
              element={
                <ProtectedRoute>
                  <MyBusiness />
                </ProtectedRoute>
              }
            />

            <Route
              path={`${business}/register`}
              element={
                <ProtectedRoute>
                  <BusinessRegistration />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route element={<BusinessManagementLayout />}>
            <Route
              path={`${business}/transactions`}
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/bookings`}
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />

            {business_type === "Accommodation" ? (
              <>
                <Route
                  path={`${business}/business-profile`}
                  element={
                    <ProtectedRoute>
                      <BusinessProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={`${business}/dashboard`}
                  element={
                    <ProtectedRoute>
                      <AccommodationDashboard />
                    </ProtectedRoute>
                  }
                />
              </>
            ) : (
              <>
                <Route
                  path={`${business}/manage-business`}
                  element={
                    <ProtectedRoute>
                      <ManageShop />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={`${business}/dashboard`}
                  element={
                    <ProtectedRoute>
                      <ShopDashboard />
                    </ProtectedRoute>
                  }
                />
              </>
            )}

            <Route
              path={`${business}/offers`}
              element={
                <ProtectedRoute>
                  <Offer />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/manage-promotion`}
              element={
                <ProtectedRoute>
                  <ManagePromotion />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/reviews`}
              element={
                <ProtectedRoute>
                  <Reviews />
                </ProtectedRoute>
              }
            />
            {/* Store routes (shop) */}
            <Route
              path={`${business}/store/products`}
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/store/orders`}
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/store/discount`}
              element={
                <ProtectedRoute>
                  <Discount />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/store/settings`}
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/profile`}
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Room routes: inside RoomProvider (and still inside BusinessProvider) */}
            <Route
              element={
                <RoomProvider>
                  <Outlet />
                </RoomProvider>
              }
            >
              <Route
                path={`${business}/rooms`}
                element={
                  <ProtectedRoute>
                    <RoomPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`${business}/room-profile`}
                element={
                  <ProtectedRoute>
                    <RoomProfile />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>
        </Route>
        <Route element={<AdminLayout />}>
          <Route
            path={`${tourism}/dashboard`}
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/approval`}
            element={
              <ProtectedRoute>
                <Approval />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/reports`}
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/reports/:id`}
            element={
              <ProtectedRoute>
                <ReportDetailsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/services/accommodation`}
            element={
              <ProtectedRoute>
                <Accommodation />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/services/shop`}
            element={
              <ProtectedRoute>
                <Shop />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/services/event`}
            element={
              <ProtectedRoute>
                <Event />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/services/tourist-spot`}
            element={
              <ProtectedRoute>
                <Spot />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/services/tourist-spot/:id`}
            element={
              <ProtectedRoute>
                <TouristSpotDetailsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/room/:id`}
            element={
              <ProtectedRoute>
                <Room />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/offer/:id`}
            element={
              <ProtectedRoute>
                <Offer />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/profile`}
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/offer`}
            element={
              <ProtectedRoute>
                <OfferAdmin />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
