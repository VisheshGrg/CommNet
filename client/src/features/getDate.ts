export const getDate = (): { time: string; fullDate: string } => {
  let date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDay();

  let time = hours + ':' + minutes + ':' + seconds;
  let fullDate = year + '/' + month + '/' + day;
  return {
    time,
    fullDate,
  };
};
