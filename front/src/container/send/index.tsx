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
  import {setError, setAlert, REG_EXP_EMAIL} from "../signup";


  const FIELD_NAME = {
    EMAIL: 'email',
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

    if (name === FIELD_NAME.EMAIL) {
      if (!REG_EXP_EMAIL.test(String(value))) {
        return FIELD_ERROR.EMAIL
      }
    }

    if (name === FIELD_NAME.SUM) {
      if (isNaN(Number(value))) {
        return FIELD_ERROR.IS_NOT_NUMBER
      }
    }

  }


export default function Container() {
const authCont = useContext(AuthContext);
const [value, setValue] = useState({email:"",sum:""});
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
    ( value: object ) =>
      JSON.stringify({
        email:(authCont)?(authCont.authContextData.user as any).email:"",
        address: (value as any).email,
        sum: (value as any).sum,
      }),
    [value]
  );

  const sendData = useCallback(
    async (dataToSend:object) => {
      dispatch({ type: REQUEST_ACTION_TYPE.PROGRESS });
      const d=convertData(dataToSend);
      console.log(d);

      try {
        const res = await fetch("http://localhost:4000/send", {
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
           
          setValue({email:"",sum:""});

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
        <h1 className="page__title">Send</h1>

        <div className="form">
        <div className="form__item">
                <Field
                    placeholder="Email отримувача коштів"
                    label="Email"
                    action={handleChange}
                    type="email"
                    name="email"
                    value={value.email}
                />
                <span id="email" className="form__error">Помилка</span>
            </div>

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

        <button onClick={handleSubmit} className="button page__button button--disabled" type="button">Send</button>

        <span className="alert alert--disabled">Увага, помилка!</span>

    </form>
    </Page>
  );
}

