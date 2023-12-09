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
  import  {AuthContext}  from "../../App";   
  import {setError, setAlert} from "../signup";


  const FIELD_NAME = {
    SUM: 'sum',
  };
const FIELD_ERROR = {
    IS_EMPTY: 'Введіть значення в поле',
    IS_BIG: 'Дуже довге значення, приберіть зайве',
    EMAIL: 'Введіть коректне значення e-mail адреси',
    PASSWORD:
      'Пароль повинен складатися з не менше ніж 8 символів, включаючи хоча б одну цифру, велику та малу літери',
    PASSWORD_AGAIN:
      'Ваш другий пароль не збігається з першим',
    NOT_CONFIRM: 'Ви не погоджуєтеся з правилами',
    ROLE: 'Ви не обрали роль',
    IS_NOT_NUMBER: 'Не числовий тип',
  };


  export const validate = (name:string, value:string) => {
    if (String(value).length < 1) {
      return FIELD_ERROR.IS_EMPTY
    }

    if (String(value).length > 20) {
      return FIELD_ERROR.IS_BIG
    }


    if (name === FIELD_NAME.SUM) {
      if (isNaN(Number(value))) {
        return FIELD_ERROR.IS_NOT_NUMBER
      }
    }

  }


export default function Container() {
const authCont = useContext(AuthContext);
const [value, setValue] = useState({sum:""});
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
    const el2 = document.querySelector('.button:last-of-type')
    if (el) {
      el.classList.toggle(
        'button--disabled',
        Boolean(disabled),
      )
    }
    if (el2) {
      el2.classList.toggle(
        'button--disabled',
        Boolean(disabled),
      )
    }
  }


  const [state, dispatch] = useReducer(requestReducer, requestInitialState);

  const convertData = useCallback(
    ( value: object, address:string ) =>
      JSON.stringify({
        email:(authCont)?(authCont.authContextData.user as any).email:"",
        address: address,
        sum: (value as any).sum,
      }),
    [value]
  );

  const sendData = useCallback(
    async (dataToSend:object, address:string) => {
      dispatch({ type: REQUEST_ACTION_TYPE.PROGRESS });
      const d=convertData(dataToSend,address);
      console.log(d);

      try {
        const res = await fetch("http://localhost:4000/recive", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: convertData(dataToSend,address),
        });

        
        const data = await res.json();
        console.log(data,res);
        if (res.ok) {
          dispatch({ type: REQUEST_ACTION_TYPE.RESET });
          setAlert(REQUEST_ACTION_TYPE.SUCCESS, data.message)
           console.log('data.session', data.session)
           
          setValue({sum:""});

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

  const handleSubmitStripe = useCallback(
    () => {
      if (disabled === true) {
      validateAll()
    } 
    
    if (disabled === false) {
      console.log(value);
      setAlert(REQUEST_ACTION_TYPE.PROGRESS, 'Завантаження...');

      return sendData(value,"Stripe");
    }},
    [sendData]
  );

  const handleSubmitCoinbase = useCallback(
    () => {
      if (disabled === true) {
      validateAll()
    } 
    
    if (disabled === false) {
      console.log(value);
      setAlert(REQUEST_ACTION_TYPE.PROGRESS, 'Завантаження...');

      return sendData(value,"Coinbase");
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
        <h1 className="page__title">Receive</h1>

        <div className="form">
            <div className="form__item">
                <Field
                    placeholder=""
                    label="Sum"
                    action={handleChange}
                    type="string"
                    name="sum"
                    value={value.sum}
                />
                <span id="sum" className="form__error">Помилка</span>
            </div>

        </div>

        <div className="divider"></div>
        <div className="recive__paysystem">Payment system</div>

        <button onClick={handleSubmitStripe} className="button page__button-recive button--disabled" type="button">
          <div className="recive__item-right">
            <div className="recive__item-image recive__item-image--stripe"></div>
            <h2 className="recive__item-info-title">Stripe</h2>
          </div>

          <div className="recive__item-left"></div>
        </button>

        <button onClick={handleSubmitCoinbase} className="button page__button-recive button--disabled" type="button">
        <div className="recive__item-right">
            <div className="recive__item-image recive__item-image--coinbase"></div>
            <h2 className="recive__item-info-title">Coinbase</h2>
          </div>

          <div className="recive__item-left"></div>         
        </button>

        <span className="alert alert--disabled">Увага, помилка!</span>

    </form>
    </Page>
  );
}

