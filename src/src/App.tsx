import { useState } from 'react';
import { isEnvBrowser } from './utils/misc';
import useNuiEvent from './hooks/useNuiEvent';
import { useExitListener } from './hooks/useExitListener';
import DutyPanel, { DutyData } from './pages/DutyPanel';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Ranks from './pages/Ranks';
import Navbar from './components/Navbar';
import { setCurrentUser, User } from './store/userSlice';
import { Rank } from './lib/permission';
import { useAppDispatch } from './store';
import { Permissions, setPermissions, setRanks } from './store/rankSlice';
import { Faction, setPlayerFactions } from './store/factionSlice';
import FactionPage from './components/FactionPage';
import { fetchNui } from './utils/fetchNui';

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

  useNuiEvent("updateRanks", (data: { permissions: Permissions, ranks: Rank[] }) => {
    dispatch(setRanks(data.ranks))
    dispatch(setPermissions(data.permissions))
  })

  useNuiEvent("updateLocalPlayer", (data: User) => {
    dispatch(setCurrentUser(data))
  })

  useNuiEvent("updateClientFactionTypes", (data: Faction[]) => {
    dispatch(setPlayerFactions(data))

    const fetchData = async () => {
      try {
        const { data } = await fetchNui<{ data: User }>("requestLocalUser")
        dispatch(setCurrentUser(data))
      } catch (err) {
        console.error("ERROR DURING requestLocalUser", err)
      }
    }

    fetchData()
  })

  //  const permissions: string[] = []
  //       Object.entries(data.permissions).forEach(([key, val]) => {
  //         permissions.push(key)
  //       })

  useNuiEvent<{
    localPlayer?: User,
    ranks?: Rank[],
    permissions?: Permissions,
    playerFactions?: Faction[]
  }>("open", (data) => {
    if (data.localPlayer) {
      dispatch(setCurrentUser(data.localPlayer))
    }

    if (data.playerFactions) {
      dispatch(setPlayerFactions(data.playerFactions))
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
                    <FactionPage page="Members" setPage={(page) => setActivePanel(page)}>
                      <Members />
                    </FactionPage>
                  )}

                  {activePanel == "Ranks" && (
                    <FactionPage page='Ranks' setPage={(page) => setActivePanel(page)}>
                      <Ranks />
                    </FactionPage>
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
