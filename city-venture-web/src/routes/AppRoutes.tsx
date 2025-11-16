import { Routes, Route, Outlet } from "react-router-dom";

// Pages
import NotFound from "../pages/NotFound";

// Layouts
import MainLayout from "../layout/MainLayout";

import LandingPage from "@/src/features/landing-page/LandingPage";
import About from "../pages/About";
import Registration from "../pages/BusinessRegistration";

import BusinessPortalLogin from "../features/auth/LoginPage";
import AdminLogin from "../features/auth/AdminLogin";
import AdminRegister from "../features/auth/AdminRegister";
import Unauthorized from "@/src/pages/Unauthorized";
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
import AccommodationPromotionForm from "../features/business/accommodation/promotion/components/PromotionForm";
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
import AccommodationSubscription from "@/src/features/business/accommodation/subscription/Subscription";
import ShopSubscription from "@/src/features/business/shop/subscription/Subscription";
import TourismStaffManagement from "@/src/features/admin/tourism-staff/TourismStaffManagement";

import Notification from "../features/business/accommodation/notfication/Notification";
import AccommodationStaff from "../features/business/accommodation/Staff/ManageStaff";
import ShopStaff from "../features/business/shop/Staff/ManageStaff";
import Test from "../pages/Test";
import TestButton from "../pages/TestButton";
import OwnerProfile from "../features/business/profile/Profile";
import TourismProfile from "../features/admin/profile/Profile";
import TouristRegister from "../features/auth/TouristRegister";

export default function AppRoutes() {
  const user = "/";
  const business = "/business";
  const tourism = "/tourism";
  const business_type = "Accommodation";

  // Normalized role names as produced by AuthService
  const TOURISM_ROLES = ["Admin", "Tourism Officer"]; // Officer has restricted pages handled per-route
  const BUSINESS_ROLES = [
    "Business Owner",
    "Manager",
    "Room Manager",
    "Receptionist",
    "Sales Associate",
  ];

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
        <Route path={`/unauthorized`} element={<Unauthorized />} />
        {/* <Route path={`/login`} element={<UnifiedLogin />} /> */}
        <Route path={`/login`} element={<BusinessPortalLogin />} />
        <Route path={`business-registration`} element={<Registration />} />
        <Route path={`/test`} element={<Test />} />
        <Route path={`/test-button`} element={<TestButton />} />
        <Route path={`user/profile`} element={<OwnerProfile />} />
        <Route path={`tourism/profile`} element={<TourismProfile />} />
        <Route path={`/register`} element={<TouristRegister />} />
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
                <ProtectedRoute requiredRoles={["Business Owner"]}>
                  <MyBusiness />
                </ProtectedRoute>
              }
            />

            <Route
              path={`${business}/register`}
              element={
                <ProtectedRoute requiredRoles={["Business Owner"]}>
                  <BusinessRegistration />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route element={<BusinessManagementLayout />}>
            <Route
              path={`${business}/transactions`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/bookings`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <Bookings />
                </ProtectedRoute>
              }
            />

            {business_type === "Accommodation" ? (
              <>
                <Route
                  path={`${business}/business-profile`}
                  element={
                    <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                      <BusinessProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={`${business}/dashboard`}
                  element={
                    <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                      <AccommodationDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={`${business}/manage-staff`}
                  element={
                    <ProtectedRoute requiredRoles={["Business Owner"]}>
                      <AccommodationStaff />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={`${business}/subscription`}
                  element={
                    <ProtectedRoute requiredRoles={["Business Owner"]}>
                      <AccommodationSubscription />
                    </ProtectedRoute>
                  }
                />
              </>
            ) : (
              <>
                <Route
                  path={`${business}/manage-business`}
                  element={
                    <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                      <ManageShop />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={`${business}/dashboard`}
                  element={
                    <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                      <ShopDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={`${business}/subscription`}
                  element={
                    <ProtectedRoute requiredRoles={["Business Owner"]}>
                      <ShopSubscription />
                    </ProtectedRoute>
                  }
                />
              </>
            )}

            {/* Offers removed from business portal */}
            <Route
              path={`${business}/manage-promotion`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <ManagePromotion />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/create-promotion`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <AccommodationPromotionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/reviews`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <Reviews />
                </ProtectedRoute>
              }
            />
            {/* Store routes (shop) */}
            <Route
              path={`${business}/store/products`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/store/categories`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/store/services`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <Services />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/store/orders`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/store/discount`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <Discount />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/store/discount/create`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <DiscountForm />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/store/discount/:id/edit`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <DiscountForm />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/promotion`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <ManageShopPromotion />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/promotion/create`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <PromotionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/promotion/:id/edit`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <PromotionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/store/settings`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <ShopSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/store/manage-staff`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <ShopStaff />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/settings`}
              element={
                <ProtectedRoute requiredRoles={["Business Owner"]}>
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
                  <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                    <RoomPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`${business}/room-profile`}
                element={
                  <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
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
                  <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
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
              <ProtectedRoute requiredRoles={TOURISM_ROLES}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Approval: Admin only */}
          <Route
            path={`${tourism}/approval`}
            element={
              <ProtectedRoute requiredRoles={["Admin"]}>
                <Approval />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/reports`}
            element={
              <ProtectedRoute requiredRoles={TOURISM_ROLES}>
                <Report />
              </ProtectedRoute>
            }
          />
          {/* Manage Tourism Staff: Admin only */}
          <Route
            path={`${tourism}/staff`}
            element={
              <ProtectedRoute requiredRoles={["Admin"]}>
                <TourismStaffManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/reports/:id`}
            element={
              <ProtectedRoute requiredRoles={TOURISM_ROLES}>
                <ReportDetailsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/services/accommodation`}
            element={
              <ProtectedRoute requiredRoles={TOURISM_ROLES}>
                <Accommodation />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/services/shop`}
            element={
              <ProtectedRoute requiredRoles={TOURISM_ROLES}>
                <Shop />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/services/event`}
            element={
              <ProtectedRoute requiredRoles={TOURISM_ROLES}>
                <Event />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/services/tourist-spot`}
            element={
              <ProtectedRoute requiredRoles={TOURISM_ROLES}>
                <Spot />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/services/tourist-spot/:id`}
            element={
              <ProtectedRoute requiredRoles={TOURISM_ROLES}>
                <TouristSpotDetailsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path={`${tourism}/room/:id`}
            element={
              <ProtectedRoute requiredRoles={TOURISM_ROLES}>
                <Room />
              </ProtectedRoute>
            }
          />
          {/* Public offer pages removed */}
          <Route
            path={`${tourism}/settings`}
            element={
              <ProtectedRoute requiredRoles={TOURISM_ROLES}>
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
