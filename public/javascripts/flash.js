

function myFunction() {
  let s = document.getElementById("id1")
  s.innerText=""
}
setTimeout(myFunction, 2000)

// import usermodel from '../../models/userModels.js';
let z1=async()=>{
  
  let a1=await document.getElementById("id_zzz")
  let a2=await a1.getAttribute("data")
  console.log(a2)
  console.log(a1.id)

}