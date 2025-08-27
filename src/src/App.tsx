import { useState } from 'react'
import { isEnvBrowser } from './utils/misc';
import useNuiEvent from './hooks/useNuiEvent';
import { useExitListener } from './hooks/useExitListener';
import DutyPanel, { DutyData } from './pages/DutyPanel';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';

export type PanelType = "off" | "DutyPanel" | "Dashboard" | "Members"

function App() {
  const [visible, setVisibility] = useState<boolean>(isEnvBrowser() ? true : false);
  const [dutyData, setDutyData] = useState<DutyData>()
  const [activePanel, setActivePanel] = useState<PanelType>("Members")
  // useExitListener(setVisibility); //TODO: UnComment

  useNuiEvent("DutyPage", (data: DutyData) => {
    setVisibility(data.visible)
    setActivePanel(data.page)
    setDutyData(data)
  })

  useNuiEvent("open", () => setVisibility(true))
  useNuiEvent("close", () => setVisibility(false))

  return (
    <div className="App">
      {visible && (
        <>
          {activePanel !== "DutyPanel" && (
            <div className="min-h-screen flex items-center justify-center px-4">
              <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl max-w-5xl w-full">

                {activePanel == "Dashboard" && (
                  <Dashboard />
                )}

                {activePanel == "Members" && (
                  <Members />
                )}

              </div>
            </div>
          )}
          {
            activePanel == "DutyPanel" && (
              <DutyPanel
                visible={visible}
                factionName={dutyData?.factionName}
                onDuty={dutyData?.onDuty || false}
                rankLabel={dutyData?.rankLabel}
              />
            )
          }
        </>
      )}
    </div>
  )
}

export default App
