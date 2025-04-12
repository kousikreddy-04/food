import { useState, useEffect, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  User, 
  ChevronDown, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  ShoppingBasket, 
  Utensils, 
  PlusCircle
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Fetch notifications
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 60000, // Refetch every minute
  });
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Handle logout
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/auth");
  };
  
  // Get notification count
  const notificationCount = notifications.length;
  
  // Tab data
  const tabs = [
    { id: "dashboard", label: "Dashboard", path: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: "food-items", label: "Food Items", path: "/food-items", icon: <ShoppingBasket className="h-5 w-5" /> },
    { id: "recipes", label: "Recipes", path: "/recipes", icon: <Utensils className="h-5 w-5" /> },
    { id: "add-item", label: "Add Item", path: "/add-item", icon: <PlusCircle className="h-5 w-5" /> }
  ];
  
  // Find active tab based on location
  const activeTab = tabs.find(tab => tab.path === location)?.id || "dashboard";
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <span className="text-primary text-3xl">🌱</span>
              <h1 className="text-xl font-semibold text-primary hidden sm:block">FreshTrack</h1>
            </div>

            <div className="flex items-center">
              {/* Notifications */}
              <DropdownMenu open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative mr-2">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {notificationCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {notificationCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b">
                      Notifications
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div key={notification.id} className="px-4 py-3 border-b hover:bg-gray-50">
                            <div className="flex items-start">
                              <span className={`mr-2 text-xl ${notification.type === 'threeDays' ? '🚨' : '⚠️'}`}></span>
                              <div>
                                <p className="text-sm text-gray-800">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.type === 'threeDays' 
                                    ? 'Critical: Check it soon' 
                                    : 'Warning: Expiring this week'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm text-gray-500">No notifications</p>
                          <p className="text-xs text-gray-400 mt-1">All your food items are good for now</p>
                        </div>
                      )}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-white">
                      <span>{user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}</span>
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {user?.name || user?.username}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation - Mobile Select */}
        {isMobile && (
          <div className="mb-6">
            <select 
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
              value={activeTab}
              onChange={(e) => {
                const selectedTab = tabs.find(tab => tab.id === e.target.value);
                if (selectedTab) {
                  navigate(selectedTab.path);
                }
              }}
            >
              {tabs.map(tab => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* Tab Navigation - Desktop */}
        {!isMobile && (
          <div className="mb-6">
            <nav className="flex space-x-4" aria-label="Tabs">
              {tabs.map(tab => (
                <Link key={tab.id} href={tab.path}>
                  <a 
                    className={`
                      px-3 py-2 font-medium text-sm rounded-md flex items-center
                      ${activeTab === tab.id 
                        ? 'bg-primary text-white' 
                        : 'text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    {isMobile ? tab.icon : <></>}
                    <span className={isMobile ? 'hidden' : ''}>{tab.label}</span>
                  </a>
                </Link>
              ))}
            </nav>
          </div>
        )}
        
        {/* Page Content */}
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-20">
          <div className="grid grid-cols-4 h-16">
            {tabs.map(tab => (
              <Link key={tab.id} href={tab.path}>
                <a
                  className={`
                    flex flex-col items-center justify-center
                    ${activeTab === tab.id 
                      ? 'text-primary bg-gray-50' 
                      : 'text-gray-500 hover:text-primary'
                    }
                  `}
                >
                  {tab.icon}
                  <span className="text-xs mt-1">{tab.label}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
