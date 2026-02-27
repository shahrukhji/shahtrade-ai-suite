import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "@/context/ToastContext";
import { AngelOneProvider } from "@/context/AngelOneContext";
import { AutoTradeProvider } from "@/context/AutoTradeContext";
import { GeminiProvider } from "@/context/GeminiContext";
import { StrategiesProvider } from "@/context/StrategiesContext";
import { SafeModeProvider } from "@/context/SafeModeContext";
import TopHeaderBar from "@/components/Layout/TopHeaderBar";
import LiveSyncBar from "@/components/Layout/LiveSyncBar";
import BottomNavBar from "@/components/Layout/BottomNavBar";
import Watermark from "@/components/Layout/Watermark";
import ToastContainer from "@/components/Common/ToastContainer";
import PageContainer from "@/components/Layout/PageContainer";
import DashboardPage from "@/pages/DashboardPage";
import FnOPage from "@/pages/FnOPage";
import AutoTradePage from "@/pages/AutoTradePage";
import PortfolioPage from "@/pages/PortfolioPage";
import SettingsPage from "@/pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastProvider>
        <AngelOneProvider>
          <SafeModeProvider>
            <AutoTradeProvider>
              <GeminiProvider>
                <StrategiesProvider>
                  <BrowserRouter>
                    <TopHeaderBar />
                    <LiveSyncBar />
                    <PageContainer>
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/fno" element={<FnOPage />} />
                        <Route path="/auto-trade" element={<AutoTradePage />} />
                        <Route path="/portfolio" element={<PortfolioPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                      </Routes>
                    </PageContainer>
                    <Watermark />
                    <BottomNavBar />
                    <ToastContainer />
                  </BrowserRouter>
                </StrategiesProvider>
              </GeminiProvider>
            </AutoTradeProvider>
          </SafeModeProvider>
        </AngelOneProvider>
      </ToastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
