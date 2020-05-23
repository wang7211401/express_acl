class Plugin {
  statusObj(start_time, end_time) {
    let start_time_num = new Date(start_time).getTime()
    let end_time_num = new Date(end_time).getTime()
    let current_time_num = new Date().getTime()
    let status, status_text
    if (start_time_num > current_time_num) {
      status = 0
      status_text = "未开始"
    } else if (end_time_num > current_time_num) {
      status = 1
      status_text = "进行中"
    } else if (current_time_num >= end_time_num) {
      status = 2
      status_text = "已结束"
    }
    return {
      status,
      status_text,
    }
  }

  formatDate(time) {
    let localDate = new Date(time)
    let year = localDate.getFullYear()
    let month = localDate.getMonth()
    let date = localDate.getDate()
    let hours = localDate.getHours()
    let minutes = localDate.getMinutes()
    let seconds = localDate.getSeconds()

    let computedMonth = month + 1 > 9 ? month + 1 : "0" + (month + 1)
    let computedDate = date > 9 ? date : "0" + date
    let computedHours = hours > 9 ? hours : "0" + hours
    let computedMinutes = minutes > 9 ? minutes : "0" + minutes
    let computedSeconds = seconds > 9 ? seconds : "0" + seconds
    return `${year}-${computedMonth}-${computedDate} ${computedHours}:${computedMinutes}:${computedSeconds}`
  }
}

let plugin = new Plugin()
module.exports = {
  plugin,
}
