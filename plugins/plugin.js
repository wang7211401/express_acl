function statusObj(start_time, end_time) {
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

exports.plugins = {
  statusObj,
}
