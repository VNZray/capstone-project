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
import Products from "../features/business/shop/store/Products";
import Categories from "../features/business/shop/store/Categories";
import Services from "../features/business/shop/store/Services";
import ServiceCategories from "../features/business/shop/store/ServiceCategories";
import Orders from "../features/business/shop/store/Orders";
import Discount from "../features/business/shop/store/Discount";
import DiscountForm from "../features/business/shop/store/DiscountForm";
import ShopSettings from "../features/business/shop/store/Settings";
import ManageShopPromotion from "../features/business/shop/promotion/ManagePromotion";
import PromotionForm from "../features/business/shop/promotion/PromotionForm";

import AccommodationDashboard from "../features/business/accommodation/dashboard/Dashboard";
import ShopDashboard from "../features/business/shop/dashboard/Dashboard";
import ManageShop from "../features/business/shop/manage-business/ManageBusiness";
import AdminLayout from "../layout/AdminLayout";
import Room from "../features/admin/services/accommodation/Room";
import Reviews from "../features/business/accommodation/reviews/Reviews";
import Settings from "../features/business/settings/Settings";

// Tourism
import Dashboard from "@/src/features/admin/dashboard/Dashboard";
import Approval from "@/src/features/admin/approval/Approval";
import Report from "@/src/features/admin/report/Report";
import Accommodation from "@/src/features/admin/services/accommodation/Accommodation";
import Shop from "@/src/features/admin/services/shop/Shop";
import Event from "@/src/features/admin/services/event/Event";
import Spot from "@/src/features/admin/services/tourist-spot/Spot";
import TouristSpotDetailsScreen from "@/src/features/admin/services/tourist-spot/TouristSpotDetailsScreen";
import { BusinessProvider } from "../context/BusinessContext";
import ReportDetailsScreen from "@/src/features/admin/report/ReportDetailsScreen";

import Notification from "../features/business/accommodation/notfication/Notification";

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

            {/* Offers removed from business portal */}
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
              path={`${business}/store/categories`}
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/store/services`}
              element={
                <ProtectedRoute>
                  <Services />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/store/service-categories`}
              element={
                <ProtectedRoute>
                  <ServiceCategories />
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
              path={`${business}/store/discount/create`}
              element={
                <ProtectedRoute>
                  <DiscountForm />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/store/discount/:id/edit`}
              element={
                <ProtectedRoute>
                  <DiscountForm />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/promotion`}
              element={
                <ProtectedRoute>
                  <ManageShopPromotion />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/promotion/create`}
              element={
                <ProtectedRoute>
                  <PromotionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/promotion/:id/edit`}
              element={
                <ProtectedRoute>
                  <PromotionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/store/settings`}
              element={
                <ProtectedRoute>
                  <ShopSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/settings`}
              element={
                <ProtectedRoute>
                  <Settings />
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

            <Route
              element={
                <RoomProvider>
                  <Outlet />
                </RoomProvider>
              }
            >
              <Route
                path={`${business}/notification`}
                element={
                  <ProtectedRoute>
                    <Notification />
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
            {/* Public offer pages removed */}
          <Route
            path={`${tourism}/settings`}
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
            {/* Admin offer pages removed */}
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
