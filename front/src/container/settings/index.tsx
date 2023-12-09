import "./index.css";
import { Page } from "../../component/page";
import { BackButton } from "../../component/back-button";
import { Field } from "../../component/field";
import { FieldPassword } from "../../component/field-password";
import React, {useState, useCallback, useReducer, useContext, Fragment} from "react";
import {
    requestReducer,
    requestInitialState,
    REQUEST_ACTION_TYPE,
  } from "../../util/request";
import {
    Navigate,
    useNavigate,
  } from "react-router-dom";
  import  {AuthContext, AUTH_ACTION_TYPE, Error}  from "../../App";   
  import {setError, setAlert, REG_EXP_EMAIL, REG_EXP_PASSWORD} from "../signup";

  const AuthRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
  const auth = React.useContext(AuthContext);

    if (auth) {
      console.log(auth);
    }
    if (!auth) return <Error />;
    return (auth.authContextData.user as any).role!==5 ? <>{children}</> : <Navigate to="/signup-confirm" replace />;
};

  const FIELD_NAME = {
  EMAIL: 'email',
  PASSWORD: 'password',
  PASSWORD_AGAIN: 'passwordAgain',
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

    if (name === FIELD_NAME.PASSWORD) {
      if (!REG_EXP_PASSWORD.test(String(value))) {
        return FIELD_ERROR.PASSWORD
      }
    }

    if (name === FIELD_NAME.PASSWORD_AGAIN) {
      if (!REG_EXP_PASSWORD.test(String(value))) {
        return FIELD_ERROR.PASSWORD
      }
    }

  }

const ChangeEmailForm: React.FC = () => {
  const FIELD_NAME = {
    EMAIL: 'email',
    PASSWORD: 'password',
  };
  
const authCont = useContext(AuthContext);
const [value, setValue] = useState({email:"",password:""});
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
        email: (value as any).email,
        password: (value as any).password,
        emailOld: (authCont)?(authCont.authContextData.user as any).email:"",
      }),
    [value]
  );

  const sendData = useCallback(
    async (dataToSend:object) => {
      dispatch({ type: REQUEST_ACTION_TYPE.PROGRESS });
      const d=convertData(dataToSend);
      console.log(d);

      try {
        const res = await fetch("http://localhost:4000/change-email", {
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
    <Fragment>
      <form className="page__section page__section--change">
      <h2 className="page__subtitle page__subtitle--start">Change email</h2>

      <div className="form form--change">
        <div className="form__item">
            <Field
                placeholder="Ваш email"
                label="New Email"
                action={handleChange}
                type="email"
                name="email"
                value={value.email}
            />
            <span id="email" className="form__error">Помилка</span>
        </div>

        <div className="form__item">
            <FieldPassword
                placeholder="Введіть пароль"
                label="Old Password"
                action={handleChange}
                type="password"
                name="password"
                value={value.password}
            />
            <span id="password" className="form__error">Помилка</span>
        </div>

      </div>

      <button onClick={handleSubmit} className="button page__button page__button--settings button--disabled" type="button">Save Email</button>

      <AuthRoute>
        <span className="alert alert--disabled">Увага, помилка!</span>
      </AuthRoute>

    </form>
    </Fragment>
  );
}



const ChangePasswordForm: React.FC = () => {
    const FIELD_NAME = {
      PASSWORD: 'password',
      PASSWORD_AGAIN: 'passwordAgain',
    };
    
  const authCont = useContext(AuthContext);
  const [value, setValue] = useState({password:"",passwordAgain:""});
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
  
      const el = document.querySelector('.button-password')
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
          password: (value as any).passwordAgain,
          email: (authCont)?(authCont.authContextData.user as any).email:"",
        }),
      [value]
    );
  
    const sendData = useCallback(
      async (dataToSend:object) => {
        dispatch({ type: REQUEST_ACTION_TYPE.PROGRESS });
        const d=convertData(dataToSend);
        console.log(d);
  
        try {
          const res = await fetch("http://localhost:4000/change-password", {
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
             
            //  if (authCont) {
            //   authCont.authDispatch({type:AUTH_ACTION_TYPE.LOGIN, payload: data.session});
            //   }
  
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
  
  const setAlert = (status:REQUEST_ACTION_TYPE, text: string) => {
      const el = document.querySelector('.alert-password')
      if (el) {
          if (status === 'progress') {
          el.className = 'alert alert--progress alert-password'
          } else if (status === 'success') {
          el.className = 'alert alert--success alert-password';
          } else if (status === 'error') {
          el.className = 'alert alert--error alert-password'
          } else {
          el.className = 'alert alert--disabled alert-password'
          }
  
          el.innerHTML = text;
      }   
  }
  
    return (
      <Fragment>
        <form className="page__section page__section--change">
        <h2 className="page__subtitle page__subtitle--start">Change password</h2>
  
        <div className="form form--change">
          <div className="form__item">
              <FieldPassword
                  placeholder="Введіть старий пароль"
                  label="Old Password"
                  action={handleChange}
                  type="password"
                  name="password"
                  value={value.password}
              />
              <span id="password" className="form__error">Помилка</span>
          </div>
  
          <div className="form__item">
              <FieldPassword
                  placeholder="Введіть новий пароль"
                  label="New password"
                  action={handleChange}
                  type="password"
                  name="passwordAgain"
                  value={value.passwordAgain}
              />
              <span id="passwordAgain" className="form__error">Помилка</span>
          </div>

        </div>
  
        <button onClick={handleSubmit} className="button page__button page__button--settings button--disabled button-password" type="button">Save Password</button>
  
        <span className="alert alert--disabled alert-password">Увага, помилка!</span>
  
      </form>
      </Fragment>
    );
  }
  

export default function Container() {
  const authCont = useContext(AuthContext);
  
    const navigate = useNavigate();

    const handleClick = () => {
      if (authCont) {
        authCont.authDispatch({type:AUTH_ACTION_TYPE.LOGOUT});
      }
        navigate("/");
    };
  
    
    return (
      <Page>
          <header className="settings__header">
              <BackButton/>
              <h1 className="settings__title">Settings</h1>
              <div></div>
          </header>

        <form className="page__section">

          <ChangeEmailForm/>
          <ChangePasswordForm/>

          <button onClick={handleClick} className="button page__button page__button--red" type="button">Log out</button>
  
        </form>
      </Page>
    );
  }
  