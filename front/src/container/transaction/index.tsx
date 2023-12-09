import "./index.css";
import { Page } from "../../component/page";
import { BackButton } from "../../component/back-button";
import React, {Suspense, Fragment, useEffect,  useCallback, useReducer} from "react";
import {
    requestReducer,
    requestInitialState,
    REQUEST_ACTION_TYPE,
  } from "../../util/request";
import {
    useParams,
  } from "react-router-dom";
// import  {AuthContext}  from "../../App";    
import { Alert, Skeleton } from "../../component/load";
import { getDate } from "../../util/getDate";


export default function Container() {
// const authCont = useContext(AuthContext);
const params = useParams();
console.log("transaction:params",params);

const [state, dispatch] = useReducer(requestReducer, requestInitialState);

  const getData = useCallback(async () => {
    dispatch({ type: REQUEST_ACTION_TYPE.PROGRESS });

    try {
      const res = await fetch(`http://localhost:4000/transaction?id=${(params as any).transactionId}`);
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

  const convertData = (raw:object):object => ({
    id: (raw as any).id,
    date: getDate((raw as any).date),
    type: (raw as any).type,
    address: (raw as any).address,
    sum: ((Number((raw as any).type)===1)?"+":"-")+"$"+Number((raw as any).sum).toFixed(2),
    classname: ("transaction__sum "+((Number((raw as any).type)===1)?"transaction__sum--green":"")),
  });
    
  

  useEffect(() => {
    getData();
  }, []);
  
  return (
    <Page>
        <header>
            <BackButton/>
        </header>

      <div className="page__section">
        <h1 className="page__title">Transaction</h1>

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
        <Fragment>
          {(
            ((
              <Fragment key={(state.data as any).id}>
                <Suspense
                  fallback={
                    <div className="box">
                    <Skeleton />
                    </div>
                  }
                >
                  <h2 className={(state.data as any).classname}>{(state.data as any).sum}</h2>

                  <div className="transaction__items">
                    <div className="transaction__item">
                      <div className="transaction__item-left">Date</div>
                      <div className="transaction__item-right">{(state.data as any).date}</div>
                    </div>                

                    <div className="divider"></div>

                    <div className="transaction__item">
                      <div className="transaction__item-left">Address</div>
                      <div className="transaction__item-right">{(state.data as any).address}</div>
                    </div>                

                    <div className="divider"></div>

                    <div className="transaction__item">
                      <div className="transaction__item-left">Type</div>
                      <div className="transaction__item-right">{(state.data as any).type===1?"Receive":"Send"}</div>
                    </div>                

                  </div>
                </Suspense>
              </Fragment>
            ))
          )}
        </Fragment>
      )}

      </div>
    </Page>
  );
}
