import WellcomePage from "./container/index";
import SignupPage from "./container/signup";
import SignupConfirmPage from "./container/signup-confirm";
import SigninPage from "./container/signin";
import RecoveryPage from "./container/recovery";
import RecoveryConfirmPage from "./container/recovery-confirm";
import BalancePage from "./container/balance";
import NotificationsPage from "./container/notifications"
import SettingsPage from "./container/settings"
import SendPage from "./container/send"
import RecivePage from "./container/recive"
import TransactionPage from "./container/transaction"

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import React, { useReducer } from "react";

export const Error: React.FC = () => {
  return <div className="App-header">Error</div>;
};

export const AuthRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
  const auth = React.useContext(AuthContext);
  let isConfirm=false;

    if (auth) {
      console.log("AuthRoute",auth);
      if (((auth.authContextData.user as any).isConfirm))
      {
        if ((auth.authContextData.user as any).isConfirm===true)
          isConfirm=true;
      }

      return (auth.authContextData.token.length===0 || isConfirm===false) ? <>{children}</> : <Navigate to="/balance" replace />;
    }
    else return <Error />;
    
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const auth = React.useContext(AuthContext);
  if (auth) {
    console.log("PrivateRoute",auth);
  }
  if (!auth) return <Error />;
  return auth.authContextData.token.length>0 ? <>{children}</> : <Navigate to="/signup" replace />;
};


export type ContextType = {
  authContextData: State;
  authDispatch: (action: Action | any) => void;
};

export const AuthContext = React.createContext<ContextType | null>(null);

export enum AUTH_ACTION_TYPE {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
}

type Action = {
  type: AUTH_ACTION_TYPE | any;
};

type State = {
  token: string;
  user: object;
};


export const authReducer = (state: State, action: any): State => {
  switch (action.type) {
    case AUTH_ACTION_TYPE.LOGIN:
      {
      return  {
        ...state,
        ...action.payload,
      };
    }
    case AUTH_ACTION_TYPE.LOGOUT:
      return  {
        ...state,
        ...{ token: "", user: {} }
      };
    default:
      return state;
  }
};

type InitialState = { 
   token: ""; user: {} ;
};

function App() {
  const initState: InitialState = {token: "", user: {}};
  const initializer = (state: InitialState) => ({ ...state });

  const [authContextData, authDispatch] = useReducer<
  React.Reducer<State, any>,
  InitialState>(authReducer, initState, initializer);

  
  return (
    <AuthContext.Provider value={{ authContextData, authDispatch }}>
      <BrowserRouter>
        <Routes>
          <Route
            index
            element={
               <AuthRoute>
                <WellcomePage />
               </AuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
               <AuthRoute>
                <SignupPage />
               </AuthRoute>
            }
          />
           <Route
            path="/signup-confirm"
            element={
              <PrivateRoute>
                <SignupConfirmPage />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/signin"
            element={
              <AuthRoute>
                <SigninPage />
              </AuthRoute>
            }
          />
          <Route
            path="/recovery"
            element={
              <AuthRoute>
                <RecoveryPage />
              </AuthRoute>
            }
          />
          <Route
            path="/recovery-confirm"
            element={
              <AuthRoute>
                <RecoveryConfirmPage />
              </AuthRoute>
            }
          />
          <Route
            path="/balance"
            element={
              <PrivateRoute>
                <BalancePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
               <PrivateRoute>
                <NotificationsPage />
               </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
               <PrivateRoute>
                <SettingsPage />
               </PrivateRoute>
            }
          />
          <Route
            path="/recive"
            element={
              <PrivateRoute>
                <RecivePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/send"
            element={
              <PrivateRoute>
                <SendPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/transaction/:transactionId"
            element={
               <PrivateRoute>
                <TransactionPage />
               </PrivateRoute>
            }
          /> 
          <Route path="*" Component={Error} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
