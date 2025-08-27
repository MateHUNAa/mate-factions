import { useState } from 'react'
import { isEnvBrowser } from './utils/misc';
import useNuiEvent from './hooks/useNuiEvent';
import { useExitListener } from './hooks/useExitListener';
import DutyPanel, { DutyData } from './pages/DutyPanel';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Ranks from './pages/Ranks';
import Navbar from './components/Navbar';
import { setCurrentUser, User } from './store/userSlice';
import { Permission, Rank } from './lib/permission';
import { useAppDispatch } from './store';
import { setPermissions, setRanks } from './store/rankSlice';

export type PanelType = "off" | "DutyPanel" | "Dashboard" | "Members" | "Ranks"

function App() {
  const [visible, setVisibility] = useState<boolean>(isEnvBrowser() ? true : false);
  const [dutyData, setDutyData] = useState<DutyData>()
  const [activePanel, setActivePanel] = useState<PanelType>("Ranks")
  const dispatch = useAppDispatch()
  useExitListener(setVisibility);

  useNuiEvent("DutyPage", (data: DutyData) => {
    setVisibility(data.visible)
    setActivePanel(data.page)
    setDutyData(data)
  })

  useNuiEvent("updateRanks", (data: { permissions: Permission[], ranks: Rank[] }) => {
    dispatch(setRanks(data.ranks))
    dispatch(setPermissions(data.permissions))
  })

  useNuiEvent<{
    localPlayer?: { data: User },
    ranks?: Rank[],
    permissions?: Permission[]
  }>("open", (data) => {
    if (data.localPlayer) {
      dispatch(setCurrentUser(data.localPlayer.data))
    }

    if (data.ranks && data.permissions) {
      dispatch(setRanks(data.ranks))
      dispatch(setPermissions(data.permissions))
    }

    setActivePanel("Dashboard")
    setVisibility(true)
  })
  useNuiEvent("close", () => setVisibility(false))

  return (
    <div className="App">
      {visible && (
        <>
          {activePanel !== "DutyPanel" && (
            <div className="min-h-screen flex items-center justify-center px-4">
              <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl max-w-6xl w-full">

                <div className='flex'>
                  <Navbar activePage={activePanel} onPageChange={setActivePanel} />

                  {activePanel == "Dashboard" && (
                    <Dashboard />
                  )}

                  {activePanel == "Members" && (
                    <Members />
                  )}

                  {activePanel == "Ranks" && (
                    <Ranks />
                  )}

                </div>

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
