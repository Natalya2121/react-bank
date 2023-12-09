// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

const { User } = require('../class/user')
const { Confirm } = require('../class/confirm')
const { Session } = require('../class/session')
const { Notification } = require('../class/notification')
const { Transaction } = require('../class/transaction')

User.create({
  email: 'test@mail.com',
  password: 123,
  role: 1,
})

// User.create({
//   email: 'admin@mail.com',
//   password: 123,
//   role: 2,
// })

// User.create({
//   email: 'developer@mail.com',
//   password: 123,
//   role: 3,
// })

// ================================================================

// router.get Створює нам один ентпоїнт
router.get('/', function (req, res) {
  // res.render генерує нам HTML сторінку

  // ↙️ cюди вводимо назву файлу з сontainer
  res.render('index', {
    // вказуємо назву контейнера
    name: 'index',
    // вказуємо назву компонентів
    component: [],

    // вказуємо назву сторінки
    title: 'Index page',
    // ... сюди можна далі продовжувати додавати потрібні технічні дані, які будуть використовуватися в layout

    // вказуємо дані,
    data: {},
  })
  // ↑↑ сюди вводимо JSON дані
})

router.post('/signup', function (req, res) {
  const { email, password } = req.body
  console.log(email, password)
  let token = ''

  if (!email || !password) {
    return res.status(400).json({
      message: "Помилка. Обов'язкові поля відсутні",
    })
  }

  try {
    const user = User.getByEmail(email)

    if (user) {
      return res.status(400).json({
        message:
          'A user with the same name is already exist',
      })
    }

    const newUser = User.create({ email, password })

    const session = Session.create(newUser)
    token = session.token

    Confirm.create(newUser.email)

    Notification.create(session, {
      operation: 'SIGNUP',
      status: 'SUCCESS',
      message: 'Користувач успішно зареєстрований',
    })

    return res.status(200).json({
      message: 'Користувач успішно зареєстрований',
      session,
    })
  } catch (err) {
    Notification.create(
      { token: token, user: { email: email } },
      {
        operation: 'SIGNUP',
        status: 'ERROR',
        message: err.message,
      },
    )

    return res.status(400).json({
      message: 'Помилка створення користувача',
    })
  }
})

router.post('/signin', function (req, res) {
  const { email, password } = req.body
  console.log(email, password)
  let token = ''

  if (!email || !password) {
    return res.status(400).json({
      message: "Помилка. Обов'язкові поля відсутні",
    })
  }

  try {
    const user = User.getByEmail(email)

    if (!user) {
      return res.status(400).json({
        message:
          'Такий email не зареєстрований. Для реєстрації натисніть Sign Up.',
      })
    }

    if (user.password !== password) {
      return res.status(400).json({
        message:
          'Невірний пароль. Для відновлення паролю натисніть Restore.',
      })
    }

    const session = Session.create(user)
    token = session.token

    Confirm.create(user.email)

    Notification.create(session, {
      operation: 'SIGNIN',
      status: 'SUCCESS',
      message: 'Користувач успішно зайшов в систему',
    })

    return res.status(200).json({
      message: 'Користувач успішно зайшов в систему',
      session,
    })
  } catch (err) {
    Notification.create(
      { token: token, user: { email: email } },
      {
        operation: 'SIGNIN',
        status: 'ERROR',
        message: err.message,
      },
    )

    return res.status(400).json({
      message: 'Помилка входу в систему',
    })
  }
})

router.post('/recovery', function (req, res) {
  const { email } = req.body
  console.log(email)

  if (!email) {
    return res.status(400).json({
      message: "Помилка. Обов'язкові поля відсутні",
    })
  }

  try {
    const user = User.getByEmail(email)

    if (!user) {
      return res.status(400).json({
        message:
          'Помилка. Користувача з таким email не існує',
      })
    }

    console.log(user)
    Confirm.create(email)

    return res.status(200).json({
      message: 'Код для відновлення паролю відправлений',
      session: { token: '', user },
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/recovery-confirm', function (req, res) {
  const { password, code, email } = req.body
  console.log(password, code, email)
  let token = ''

  if (!password || !code || !email) {
    return res.status(400).json({
      message: "Помилка. Обов'язкові поля відсутні",
    })
  }

  try {
    const user = User.getByEmail(email)

    if (!user) {
      return res.status(400).json({
        message:
          'Помилка. Користувача з таким email не існує',
      })
    }

    const email_cod = Confirm.getData(Number(code))

    if (!email_cod || email !== email_cod) {
      return res.status(400).json({
        message: 'Помилка. Код не існує',
      })
    }

    user.password = password

    console.log(user)

    const session = Session.create(user)
    token = session.token

    Notification.create(session, {
      operation: 'RECOVERY-CONFIRM',
      status: 'SUCCESS',
      message: 'Пароль змінено',
    })

    return res.status(200).json({
      message: 'Пароль змінено',
      session,
    })
  } catch (err) {
    Notification.create(
      { token: token, user: { email: email } },
      {
        operation: 'RECOVERY-CONFIRM',
        status: 'ERROR',
        message: err.message,
      },
    )

    return res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/signup-confirm', function (req, res) {
  const { code, token, email } = req.body
  console.log(code, token, email)

  if (!token || !code || !email) {
    return res.status(400).json({
      message: "Помилка. Обов'язкові поля відсутні",
    })
  }

  try {
    // const session = Session.get(token)
    const session = Session.getByEmail(email)

    if (!session) {
      return res.status(400).json({
        message: 'Помилка. Ви не увійшли в аккаунт',
      })
    }

    const email_cod = Confirm.getData(code)

    if (!email_cod || email_cod != email) {
      Notification.create(
        { token: token, user: { email: email } },
        {
          operation: 'SIGNUP-CONFIRM',
          status: 'WARNING',
          message: 'Код не існує',
        },
      )

      return res.status(400).json({
        message: 'Код не існує',
      })
    }

    if (email !== session.user.email) {
      Notification.create(
        { token: token, user: { email: email } },
        {
          operation: 'SIGNUP-CONFIRM',
          status: 'WARNING',
          message: 'Код не дійсний',
        },
      )

      return res.status(400).json({
        message: 'Код не дійсний',
      })
    }

    const user = User.getByEmail(session.user.email)
    user.isConfirm = true
    session.user.isConfirm = true
    if (session.user.role === 5 && session.user.emailOld) {
      Transaction.changeEmail(email, session.user.emailOld)
    }
    user.role = 1
    session.user.role = 1

    Notification.create(session, {
      operation: 'SIGNUP-CONFIRM',
      status: 'SUCCESS',
      message: 'Ви підтвердили свою пошту',
    })

    return res.status(200).json({
      message: 'Ви підтвердили свою пошту',
      session,
    })
  } catch (err) {
    Notification.create(
      { token: token, user: { email: email } },
      {
        operation: 'SIGNUP-CONFIRM',
        status: 'ERROR',
        message: err.message,
      },
    )

    return res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/login', function (req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      message: "Помилка. Обов'язкові поля відсутні",
    })
  }

  try {
    const user = User.getByEmail(email)

    if (!user) {
      return res.status(400).json({
        message:
          'Помилка. Користувач з таким email не існує',
      })
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: 'Помилка. Пароль не підходить',
      })
    }

    const session = Session.create(user)

    return res.status(200).json({
      message: 'Ви увійшли',
      session,
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    })
  }
})

router.get('/notification', (req, res) => {
  try {
    const { email } = req.query
    console.log(email)

    let list = Notification.getByEmail(email)
    // if (list.length === 0) list = Notification.getList()

    if (list.length === 0) {
      return res.status(200).json({
        list: [],
      })
    }

    // let list2 = list.map(({ id, action }) => ({
    //   id,
    //   operation: action.operation,
    //   status: action.status,
    //   message: action.message,
    //   date: action.date,
    // }))

    // console.log(list2)

    return res.status(200).json({
      list: list.map(({ id, action }) => ({
        id,
        operation: action.operation,
        status: action.status,
        message: action.message,
        date: action.date,
      })),
    })
  } catch (e) {
    return res.status(400).json({
      message: e.message,
    })
  }
})

router.get('/balance', (req, res) => {
  try {
    const { email } = req.query
    console.log(email)

    let list = Transaction.getByEmail(email)
    // if (list.length === 0) list = Transaction.getList()

    if (list.length === 0) {
      return res.status(200).json({
        list: [],
      })
    }

    // let list2 = list.map(({ id, action }) => ({
    //   id,
    //   operation: action.operation,
    //   status: action.status,
    //   message: action.message,
    //   date: action.date,
    // }))

    // console.log(list2)

    return res.status(200).json({
      list: list.map(({ id, transaction }) => ({
        id,
        date: transaction.date,
        type: transaction.type,
        address: transaction.address,
        sum: transaction.sum,
      })),
    })
  } catch (e) {
    return res.status(400).json({
      message: e.message,
    })
  }
})

router.get('/transaction', (req, res) => {
  try {
    const { id } = req.query
    console.log(id)

    if (!id) {
      return res.status(400).json({
        message: "Помилка. Обов'язкові поля відсутні",
      })
    }

    let trans = Transaction.getById(Number(id))

    if (!trans) {
      return res.status(400).json({
        message: 'Помилка. Транзакція відсутня',
      })
    }

    return res.status(200).json({
      id: trans.id,
      date: trans.transaction.date,
      type: trans.transaction.type,
      address: trans.transaction.address,
      sum: trans.transaction.sum,
    })
  } catch (e) {
    return res.status(400).json({
      message: e.message,
    })
  }
})

router.post('/recive', function (req, res) {
  const { address, sum, email } = req.body
  console.log(address, sum, email)
  let token = ''

  if (!address || !sum || !email) {
    return res.status(400).json({
      message: "Помилка. Обов'язкові поля відсутні",
    })
  }

  try {
    const session = Session.getByEmail(email)

    if (!session) {
      return res.status(400).json({
        message: 'Помилка. Ви не увійшли в аккаунт',
      })
    }

    token = session.token

    if (address === email) {
      Notification.create(
        { token: session.token, user: { email: email } },
        {
          operation: 'RECEIVING',
          status: 'WARNING',
          message:
            'Помилка. Адреса відправника співпадає з адресою отримувача',
        },
      )

      return res.status(400).json({
        message:
          'Помилка. Адреса відправника співпадає з адресою отримувача',
      })
    }

    const trans = Transaction.create(session, {
      type: 1,
      address: address,
      sum: sum,
    })
    console.log(trans)

    Notification.create(session, {
      operation: 'RECEIVING',
      status: 'SUCCESS',
      message: 'Ви отримали кошти',
    })

    return res.status(200).json({
      message: 'Ви отримали кошти',
      trans,
    })
  } catch (err) {
    Notification.create(
      { token: token, user: { email: email } },
      {
        operation: 'RECEIVING',
        status: 'ERROR',
        message: err.message,
      },
    )

    return res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/send', function (req, res) {
  const { address, sum, email } = req.body
  console.log(address, sum, email)
  let token = ''

  if (!address || !sum || !email) {
    return res.status(400).json({
      message: "Помилка. Обов'язкові поля відсутні",
    })
  }

  try {
    const session = Session.getByEmail(email)

    if (!session) {
      return res.status(400).json({
        message: 'Помилка. Ви не увійшли в аккаунт',
      })
    }

    token = session.token

    if (address === email) {
      Notification.create(
        { token: session.token, user: { email: email } },
        {
          operation: 'SENDING',
          status: 'WARNING',
          message:
            'Помилка. Адреса відправника співпадає з адресою отримувача',
        },
      )

      return res.status(400).json({
        message:
          'Помилка. Адреса відправника співпадає з адресою отримувача',
      })
    }

    const trans = Transaction.create(session, {
      type: 0,
      address: address,
      sum: sum,
    })
    console.log(trans)

    Notification.create(session, {
      operation: 'SENDING',
      status: 'SUCCESS',
      message: 'Ви здійснили перерахунок коштів',
    })

    return res.status(200).json({
      message: 'Ви здійснили перерахунок коштів',
      trans,
    })
  } catch (err) {
    Notification.create(
      { token: token, user: { email: email } },
      {
        operation: 'SENDING',
        status: 'ERROR',
        message: err.message,
      },
    )

    return res.status(400).json({
      message: err.message,
    })
  }
})

router.post('/change-email', function (req, res) {
  const { email, password, emailOld } = req.body
  console.log(email, password, emailOld)
  let token = ''

  if (!email || !password || !emailOld) {
    return res.status(400).json({
      message: "Помилка. Обов'язкові поля відсутні",
    })
  }

  try {
    if (emailOld === email) {
      return res.status(400).json({
        message:
          'Помилка. Ведіть новий email, щоб змінити старий',
      })
    }

    const userOld = User.getByEmail(emailOld)
    if (!userOld) {
      return res.status(400).json({
        message:
          'Помилка. Користувач з таким email не існує',
      })
    }

    const sessionOld = Session.getByEmail(emailOld)
    if (!sessionOld) {
      return res.status(400).json({
        message:
          'Помилка. Помилка. Ви не увійшли в аккаунт',
      })
    }

    token = sessionOld.token

    const user = User.getByEmail(email)
    if (user) {
      Notification.create(
        { token: token, userOld },
        {
          operation: 'CHANGE-EMAIL',
          status: 'WARNING',
          message:
            'A user with the same name is already exist',
        },
      )
      return res.status(400).json({
        message:
          'A user with the same name is already exist',
      })
    }

    if (password !== userOld.password) {
      Notification.create(
        { token: token, userOld },
        {
          operation: 'CHANGE-EMAIL',
          status: 'WARNING',
          message: 'Помилка. Ви ввели неправильний пароль',
        },
      )
      return res.status(400).json({
        message: 'Помилка. Ви ввели неправильний пароль',
      })
    }

    const newUser = User.create({ email, password })
    newUser.role = 5

    const session = Session.create(newUser)
    // session.token = token

    session.user.emailOld = emailOld

    Confirm.create(email)

    Notification.create(session, {
      operation: 'CHANGE-EMAIL',
      status: 'SUCCESS',
      message: 'Користувач успішно зареєстрований',
    })

    return res.status(200).json({
      message: 'Користувач успішно зареєстрований',
      session,
    })
  } catch (err) {
    Notification.create(
      { token: token, user: { email: emailOld } },
      {
        operation: 'CHANGE-EMAIL',
        status: 'ERROR',
        message: err.message,
      },
    )

    return res.status(400).json({
      message: 'Помилка створення користувача',
    })
  }
})

router.post('/change-password', function (req, res) {
  const { email, password } = req.body
  console.log(email, password)
  let token = ''

  if (!email || !password) {
    return res.status(400).json({
      message: "Помилка. Обов'язкові поля відсутні",
    })
  }

  try {
    const user = User.getByEmail(email)
    if (!user) {
      return res.status(400).json({
        message:
          'Помилка. Користувач з таким email не існує',
      })
    }

    const session = Session.getByEmail(email)
    if (!session) {
      return res.status(400).json({
        message: 'Помилка. Ви не увійшли в аккаунт',
      })
    }

    token = session.token

    if (password === user.password) {
      Notification.create(session, {
        operation: 'CHANGE-PASSWORD',
        status: 'WARNING',
        message:
          'Помилка. Старий пароль такий самий як новий',
      })

      return res.status(400).json({
        message:
          'Помилка. Старий пароль такий самий як новий',
      })
    }

    user.password = password

    Notification.create(session, {
      operation: 'CHANGE-PASSWORD',
      status: 'SUCCESS',
      message: 'Пароль успішно змінений',
    })

    return res.status(200).json({
      message: 'Пароль успішно змінений',
      session,
    })
  } catch (err) {
    Notification.create(
      { token: token, user: { email: email } },
      {
        operation: 'CHANGE-PASSWORD',
        status: 'ERROR',
        message: err.message,
      },
    )

    return res.status(400).json({
      message: 'Помилка зміни пароля',
    })
  }
})

// Підключаємо роутер до бек-енду
module.exports = router
