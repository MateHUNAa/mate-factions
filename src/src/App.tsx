import { useState } from 'react'
import { isEnvBrowser } from './utils/misc';
import useNuiEvent from './hooks/useNuiEvent';
import { useExitListener } from './hooks/useExitListener';
import DutyPanel, { DutyData } from './components/DutyPanel';

export type PanelType = "off" | "DutyPanel"

function App() {
  const [visible, setVisibility] = useState<boolean>(isEnvBrowser() ? true : false);
  const [dutyData, setDutyData] = useState<DutyData>()
  const [activePanel, setActivePanel] = useState<PanelType>("off")
  useExitListener(setVisibility);

  useNuiEvent("DutyPage", (data: DutyData) => {
    setVisibility(data.visible)
    setActivePanel(data.page)
    setDutyData(dutyData)
  })

  useNuiEvent("open", () => setVisibility(true))
  useNuiEvent("close", () => setVisibility(false))

  return (
    <div className="App">
      {visible && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl max-w-5xl w-full">

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

          </div>
        </div>
      )}
    </div>
  )
}

export default App
