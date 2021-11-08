

var vreme = document.getElementById("vremeSideNav");

if(vreme != null){
  function time() {
      var d = new Date();
      let yy = d.getFullYear();
      let mm = d.getMonth() + 1;
      let dd = d.getUTCDate();
      var s = d.getSeconds();
      var m = d.getMinutes();
      var h = d.getHours();
      vreme.textContent = 
          ("0" + dd).substr(-2) + "." + ("0" + mm).substr(-2) + "." + yy + " " +
          ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2) + ":" + ("0" + s).substr(-2);
    }

  setInterval(time, 1000);
}
