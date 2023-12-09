class Notification {
  static #list = []
  static #count = 1

  constructor(session, action) {
    this.id = Notification.#count++

    this.token = session.token
    this.user = {
      email: session.user.email,
    }
    this.action = {
      date: Date.now(),
      operation: action.operation,
      status: action.status,
      message: action.message,
    }
  }

  static create = (session, action) => {
    const notification = new Notification(session, action)
    this.#list.push(notification)

    console.log(notification)

    return notification
  }

  static getByEmail(email) {
    return (
      this.#list.filter(
        (notification) =>
          notification.user.email ===
          String(email).toLowerCase(),
      ) || null
    )
  }

  static getList = () => this.#list

  static getById(id) {
    return (
      this.#list.find(
        (notification) => notification.id === id,
      ) || null
    )
  }
}

module.exports = { Notification }
