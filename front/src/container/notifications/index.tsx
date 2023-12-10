import "./index.css";
import { Page } from "../../component/page";
import { BackButton } from "../../component/back-button";
import React, {Suspense, Fragment, useEffect, useCallback, useReducer, useContext} from "react";
import {
    requestReducer,
    requestInitialState,
    REQUEST_ACTION_TYPE,
  } from "../../util/request";
import  {AuthContext}  from "../../App";    
import { Alert, Skeleton } from "../../component/load";
import { getDate } from "../../util/getDate";

type Data = {
  list: Array<object>;
};

export default function Container() {
const authCont = useContext(AuthContext);

const [state, dispatch] = useReducer(requestReducer, requestInitialState);

  const getData = useCallback(async () => {
    dispatch({ type: REQUEST_ACTION_TYPE.PROGRESS });

    try {
      const res = await fetch(`http://localhost:4000/notification?email=${(authCont)?(authCont.authContextData.user as any).email:""}`);
      const data = await res.json();
      console.log("getData", data)

      if (res.ok) {
        console.log("Notification:getData",convertData(data));
        dispatch({
          type: REQUEST_ACTION_TYPE.SUCCESS,
          payload: convertData(data),
        });
      } else {
        dispatch({ type: REQUEST_ACTION_TYPE.ERROR, payload: data.message });
      }
    } catch (e) {
      dispatch({ type: REQUEST_ACTION_TYPE.ERROR, payload: (e as any).message });
    }
  }, []);

 
  const convertData = (raw: Data): Data | any=> {
    const list_data:Array<object> = raw.list.reverse().map((item) => 
    ({id:(item as any).id, operation:(item as any).operation, status:(item as any).status, message:(item as any).message, date: getDate((item as any).date), classname: (("notification__item-image ")+(((item as any).status!=="SUCCESS")?"notification__item-image--danger":"")) })
    )

    return { list:list_data,
      classItems: ("notification__items "+(list_data.length<=8?"":"notification__scrollbar")),
  }
};

  useEffect(() => {
    getData();
  }, []);
  
  return (
    <Page>
        <header>
            <BackButton/>
        </header>

      <div className="page__section">
        <h1 className="page__title">Notifications</h1>

      {(state.status as any) === REQUEST_ACTION_TYPE.PROGRESS && (
        <Fragment>
          <div className="box">
            <Skeleton />
          </div>
          <div className="box">
            <Skeleton />
          </div>
        </Fragment>
      )}

      {(state.status as any) === REQUEST_ACTION_TYPE.ERROR && (
        <Alert status={(state.status as any)} message={state.message} />
      )}

      {(state.status as any) === REQUEST_ACTION_TYPE.SUCCESS && (
        //  <Fragment>
        <div className={(state.data as any).classItems}>
          {(state.data as Data).list.length===0 ? (
            <Alert message="Список пустий" />
          ) : (
            (state.data as Data).list.map((item: object) => (
              <Fragment key={(item as any).id}>
                <Suspense
                  fallback={
                    <div className="box">
                    <Skeleton />
                    </div>
                  }
                >
                  <div className="notification__item">
                  
                    <div className={(item as any).classname}></div>
                    <div className="notification__item-info">
                      <h2 className="notification__item-info-title">{(item as any).operation}</h2>
                      <p className="notification__item-info-text">
                        {(item as any).date} - {(item as any).message}
                      </p>
                    </div>
                  </div>
                </Suspense>
              </Fragment>
            ))
          )}
        </div>
        // </Fragment>
        )}

      </div>
    </Page>
  );
}
