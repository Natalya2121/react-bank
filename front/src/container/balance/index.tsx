import "./index.css";
import React, {Suspense, Fragment, useEffect, useCallback, useReducer, useContext} from "react";
import { Link } from "react-router-dom";
import {
    requestReducer,
    requestInitialState,
    REQUEST_ACTION_TYPE,
  } from "../../util/request";
import {
    useNavigate,
  } from "react-router-dom";
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
      const res = await fetch(`http://localhost:4000/balance?email=${(authCont)?(authCont.authContextData.user as any).email:""}`);
      const data = await res.json();
      console.log("getData", data)

      if (res.ok) {
        console.log("balance:getData",convertData(data));
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

  const navigate = useNavigate();

  const convertData = (raw: Data): Data | any => {
    const list_data:Array<object> = raw.list.reverse().map((item) => 
    ({id:(item as any).id, type:(item as any).type, address:(item as any).address, sum:(item as any).sum, date: getDate((item as any).date), typename:(Number((item as any).type)===1?"Receipt":"Sending"),
    classname: (("trans__item-image ")+(((item as any).type===1)?("trans__item-image--"+(item as any).address.toString().toLowerCase()):"")),
    sumtext: (((item as any).type===0)?("-$"):("+$"))+Number((item as any).sum).toFixed(2),
    classnamesum: (("trans__sum ")+(((item as any).type===1)?("trans__sum--green"):"")),
    onclick:() => {navigate("/transaction/"+(item as any).id.toString())},
  })
    )
    
    let s=raw.list.reduce((summ, item) => summ +  (((item as any).type===0) ? -Number((item as any).sum):Number((item as any).sum)), 0);

    return { list:list_data,
      summa: (s>=0?"+$":"-$")+Math.abs(s).toFixed(2),
      classItems: ("trans__items "+(list_data.length<=8?"":"trans__scrollbar")),
    }
};

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="page page-balance--background">
        <div className="header">
          <Link className="settings-button" to="/settings"/>
          <div className="header__title">Main wallet</div>
          <Link className="notifications-button" to="/notifications"/>
        </div>


        {(state.status as any) === REQUEST_ACTION_TYPE.SUCCESS && (
        <Fragment> <h1 className="page-balance__title">{(state.data as any).summa}</h1> </Fragment>
      )}


        <div className="page-balance__buttons">
          <Link className="page-balance__button" to="/recive">
            <div className="page-balance__button-receive-img"></div>
            <div className="page-balance__button-text">Receive</div>
          </Link>
          <Link className="page-balance__button" to="/send">
            <div className="page-balance__button-send-img"></div>
            <div className="page-balance__button-text">Send</div>
          </Link>
        </div>


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
        // <Fragment>
        <div className={(state.data as any).classItems}>

          {(state.data as Data).list.length===0 ? (
            <Alert message="Список транзакцій порожній" />
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
                  <div onClick={(item as any).onclick} className="trans__item ">
                    <div className="trans__item-right">
                      <div className={(item as any).classname}></div>
                      <div className="trans__item-info">
                        <h2 className="trans__item-info-title">{(item as any).address}</h2>
                        <p className="trans__item-info-text">
                          {(item as any).date} - {(item as any).typename}
                        </p>
                      </div>
                    </div>

                    <div className={(item as any).classnamesum}>{(item as any).sumtext}</div>
                  </div>

                </Suspense>
              </Fragment>
            ))
          )}
        </div>
        // </Fragment>
        )}


    </div>
  );
}
