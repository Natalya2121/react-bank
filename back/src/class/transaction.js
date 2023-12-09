class Transaction {
  static #list = []
  static #count = 1

  constructor(session, transaction) {
    this.id = Transaction.#count++

    this.token = session.token
    this.user = {
      email: session.user.email,
    }
    this.transaction = {
      date: Date.now(),
      type: transaction.type,
      address: transaction.address,
      sum: transaction.sum,
    }
  }

  static create = (session, transaction) => {
    const trans = new Transaction(session, transaction)
    this.#list.push(trans)

    console.log(trans)

    return trans
  }

  static getByEmail(email) {
    return (
      this.#list.filter(
        (transaction) =>
          transaction.user.email ===
          String(email).toLowerCase(),
      ) || null
    )
  }

  static changeEmail(email, emailOld) {
    this.#list
      .filter(
        (transaction) =>
          transaction.user.email ===
          String(emailOld).toLowerCase(),
      )
      .forEach((item) => (item.user.email = email))
  }

  static getList = () => this.#list

  static getById(id) {
    return (
      this.#list.find((trans) => trans.id === id) || null
    )
  }
}

module.exports = { Transaction }
