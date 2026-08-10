import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Redirect, Route } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import Login from '@/pages/Login'
import DashboardLayout from '@/components/DashboardLayout'

setupIonicReact({ mode: 'ios' })

export default function App() {
  return (
    <AppProvider>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/login" component={Login} />
            <Route path="/dashboard" component={DashboardLayout} />
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </AppProvider>
  )
}
