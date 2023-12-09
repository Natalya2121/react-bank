import "./index.css";
import { Page } from "../../component/page";
import { BackButton } from "../../component/back-button";
import { Field } from "../../component/field";
import React, {useState, useCallback, useReducer, useContext} from "react";
import {
    requestReducer,
    requestInitialState,
    REQUEST_ACTION_TYPE,
  } from "../../util/request";
  import  {AuthContext, AUTH_ACTION_TYPE, AuthRoute}  from "../../App";   
  import {setError, setAlert} from "../signup";


  const FIELD_NAME = {
    CODE: 'code',
  }
  const FIELD_ERROR = {
    IS_EMPTY: 'Введіть значення в поле',
    IS_BIG: 'Дуже довге значення, приберіть зайве',
    IS_NOT_NUMBER: 'Не числовий тип',
  }

  export const validate = (name:string, value: string) => {
    if (String(value).length < 1) {
      return FIELD_ERROR.IS_EMPTY
    }

    if (String(value).length > 20) {
      return FIELD_ERROR.IS_BIG
    }

    if (isNaN(Number(value))) {
      return FIELD_ERROR.IS_NOT_NUMBER
    }
  }


export default function Container() {
const authCont = useContext(AuthContext);
const [value, setValue] = useState({code:""});
let error = {};
let disabled = true;

const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
setValue({
        ...value,
        [e.currentTarget.name]: e.currentTarget.value,
      });

    let name=e.currentTarget.name;
    const err = validate(name, e.currentTarget.value);

    if (err) {
      setError(name, err);
      (error as any)[name] = err;
    } else {
      setError(name, null);
      delete (error as any)[name]
    //   delete error[name];
    }

    checkDisabled(name);
}
  
const checkDisabled = (name:string) => {
    disabled=false
    Object.values(FIELD_NAME).forEach((name) => {
      if (
        (error as any)[name] ||
        (value as any)[name] === 0
      ) {
        disabled = true
      }
    })

    const el = document.querySelector('.button')
    if (el) {
      el.classList.toggle(
        'button--disabled',
        Boolean(disabled),
      )
    }
  }


  const [state, dispatch] = useReducer(requestReducer, requestInitialState);

  const convertData = useCallback(
    ( value: object ) =>{
      // const auth = React.useContext(AuthContext);
      const token=(authCont)?authCont.authContextData.token:"";

  return JSON.stringify({
        code: (value as any).code,
        token: token,
        email: (authCont)?(authCont.authContextData.user as any).email:"",
      });
    },
    [value]
  );

  const sendData = useCallback(
    async (dataToSend:object) => {
      dispatch({ type: REQUEST_ACTION_TYPE.PROGRESS });
      const d=convertData(dataToSend);
      console.log(d);

      try {
        const res = await fetch("http://localhost:4000/signup-confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: convertData(dataToSend),
        });

        
        const data = await res.json();
        console.log(data,res);
        if (res.ok) {
          dispatch({ type: REQUEST_ACTION_TYPE.RESET });
          setAlert(REQUEST_ACTION_TYPE.SUCCESS, data.message)
           console.log('data.session', data.session)
           
          if (authCont) {
            authCont.authDispatch({type:AUTH_ACTION_TYPE.LOGIN, payload: data.session});
          }

          } else {
          dispatch({ type: REQUEST_ACTION_TYPE.ERROR, payload: data.message });
          setAlert(REQUEST_ACTION_TYPE.ERROR, data.message)
        }
      } catch (e: any) {
        dispatch({ type: REQUEST_ACTION_TYPE.ERROR, payload: e.message });
        setAlert(REQUEST_ACTION_TYPE.ERROR, e.message)
    }
    },
    [convertData]
  );

  const handleSubmit = useCallback(
    () => {
        console.log("handleSubmit");
        console.log(value,disabled);
      if (disabled === true) {
      validateAll()
    } 
    
    if (disabled === false) {
      console.log(value);
      setAlert(REQUEST_ACTION_TYPE.PROGRESS, 'Завантаження...');

      return sendData(value);
    }},
    [sendData]
  );


  const validateAll = () => {
    let dis = false

    Object.values(FIELD_NAME).forEach((name) => {
      const error = validate(name, (value as any)[name])

      if (error) {
        setError(name, error)
        dis = true
      }
    })

    disabled = dis
  }

  return (
    <Page>
        <header>
            <BackButton/>
        </header>

        <form className="page__section">
        <h1 className="page__title">Confirm account</h1>
        <h2 className="page__subtitle">Write the code you received</h2>

        <div className="form">
            <div className="form__item">
                <Field
                    placeholder="0000"
                    label="Code"
                    action={handleChange}
                    type="string"
                    name="code"
                    value={(value as any).code}
                />
                <span id="code" className="form__error">Помилка</span>
            </div>

        </div>

        <button onClick={handleSubmit} className="button page__button button--disabled" type="button">Confirm</button>

        <AuthRoute>
          <span className="alert alert--disabled"><div className="danger"></div><div> Увага, помилка!</div></span>
        </AuthRoute>

    </form>
    </Page>
  );
}
