var online =false;
function getRequestObject() 
{
   if (window.ActiveXObject) 
   {
      return ( new ActiveXObject("Microsoft.XMLHTTP"));
   } 
   else if (window.XMLHttpRequest) 
   {
      return (new XMLHttpRequest());
   } 
   else 
   {
      return null;
   }
}

function register_form() 
{
   document.getElementById('content').innerHTML = `
   <form name="form">            
      <table>
         <tr>
            <td><label for="email">Adres email:</label></td>
            <td><input type="email" id="email" name="email"/></td>
         </tr>
         <tr>
            <td><label for="pass">Hasło:</label></td>
            <td><input type="password" id="pass" name="pass" /></td>
         </tr>
         <tr>
            <td><input type="button" value="Zarejestruj" onclick="validate_register(this.form)"></td>
         </tr>
      </table>
   </form> 
   `
}

function login_form() 
{
   document.getElementById('content').innerHTML = `
   <form name="form" id="logForm">            
      <table>
         <tr>
            <td><label for="email">Adres email:</label></td>
            <td><input type="email" id="email" name="email"/></td>
         </tr>
         <tr>
            <td><label for="pass">Hasło:</label></td>
            <td><input type="password" id="pass" name="pass" /></td>
         </tr>
         <tr>
            <td><input type="button" value="Zaloguj" onclick="login(this.form)"></td>
         </tr>
      </table>
   </form> 
   `
}



function validate_register(form) 
{

   document.getElementById('result').innerHTML = "";
   document.getElementById('noAccessInfo').innerHTML = "";

   let user = {};
   user.email = form.email.value;
   user.pass = form.pass.value;
   if(user.email == "" || user.pass == "") 
   {
      document.getElementById('result').innerHTML = "Pola nie mogą być puste";
      return;
   }
   request = getRequestObject();
   request.onreadystatechange = function() 
   {
      if (request.readyState == 4) 
      {
         objJSON = JSON.parse(request.response);
         for (var id in objJSON) 
         {
            if (objJSON[id].email == user.email)
            {
               document.getElementById('result').innerHTML = "Uzytkownik o danym adresie email juz istnieje";
               return;
            }
         }
         register(form);
      }
   }
   request.open("GET", "http://pascal.fis.agh.edu.pl/~9rewis/projekt2/rest/list", true);
   request.send(null);
}

function register(form) 
{
   document.getElementById('result').innerHTML = "";
   document.getElementById('noAccessInfo').innerHTML = "";

   let user = {};
   user.email = form.email.value;
   user.pass = (form.pass.value);
   txt = JSON.stringify(user);
   request = getRequestObject();
   request.onreadystatechange = function() 
   {
      if (request.readyState == 4 && request.status == 200) 
      {
         document.getElementById('result').innerHTML = "Zostałeś zarejestrowany";
      }
   }
   request.open("POST", "http://pascal.fis.agh.edu.pl/~9rewis/projekt2/rest/save", true);
   request.send(txt);
}

function login(form) 
{
   document.getElementById('result').innerHTML = "";
   document.getElementById('noAccessInfo').innerHTML = "";

   let user = {};
   user.email = form.email.value;
   user.pass = form.pass.value;
   txt = JSON.stringify(user);
   request = getRequestObject();
   request.onreadystatechange = function() 
   {
      if(request.readyState == 4 && request.status == 200)
      {
         objJSON = JSON.parse(request.response);
         document.getElementById('menuBox').style.display = 'none';
         document.getElementById('logoutBox').style.display = 'block';
         document.getElementById('logForm').style.display = 'none';
         document.getElementById('noAccessInfo').style.display = 'none';
         
      }
      if(request.readyState == 4 && request.status == 204) 
      {
         document.getElementById('result').innerHTML = "Niepoprawne dane logownia";      
      }
   }
   request.open("POST", "http://pascal.fis.agh.edu.pl/~9rewis/projekt2/rest/login", true);
   request.send(txt);
   online=true;
   
   
}

function logout() 
{
   document.getElementById('noAccessInfo').innerHTML = "";
    request = getRequestObject();
    request.onreadystatechange = function () 
    {
      if (request.readyState == 4 && request.status == 200)
      {
         document.getElementById('menuBox').style.display = 'block';
         document.getElementById('logoutBox').style.display = 'none';
         document.getElementById('myChart').style.display = 'none';
         document.getElementById('myChart2').style.display = 'none';
         indexedDB.deleteDatabase("wynik");
      }
    }
    request.open("POST", "http://pascal.fis.agh.edu.pl/~9rewis/projekt2/rest/logout", true);
    request.send(null);
    online=false;
}

function save_answers(form)
{
   
   let answer = {};
   
   answer.age = form.age.value;
   answer.gra = form.gra.value;
   if(answer.age== "" || answer.gra == "") 
   {
      document.getElementById('result1').innerHTML = "Pola nie mogą być puste";
      return;
   }
   txt = JSON.stringify(answer);
   
   if(online==false)
   {
      
      var conn = window.indexedDB.open("wynik",2);
      
        conn.onupgradeneeded = function (event)
         {
            var db = event.target.result;
            var objectStore = db.createObjectStore('answer', {autoIncrement: true});
            console.log(objectStore);
            
            objectStore.createIndex("age", "age");
          	objectStore.createIndex("gra", "gra");
         
        };
        conn.onsuccess = function (event) {
            var db = event.target.result;
            var transaction = db.transaction('answer', 'readwrite');
            var objectStore = transaction.objectStore('answer');
            var objectRequest = objectStore.put(txt);
            objectRequest.onerror = function (event) {
                console.log("error");
                console.log(event);
         };
    
        objectRequest.onsuccess = function (event) {
            document.getElementById('result1').innerHTML = " Dane zostały zapisane do lokalnej bazy";
            document.querySelector("[name='age']").value=0;
            document.querySelector("[name='gra']").value=""; 
            wynik();
        };
        
        
    }
   }

   
   else
   {
      console.log(txt);
      document.getElementById('result').innerHTML = "";
      document.getElementById('noAccessInfo').innerHTML = "";
      txt2 = JSON.stringify(answer);
      request = getRequestObject();
      request.onreadystatechange = function() 
      {
         if (request.readyState == 4 && request.status == 200) 
         {
            document.getElementById('result1').innerHTML = "Dane zapisane do bazy";
            document.querySelector("[name='age']").value=0;
            document.querySelector("[name='gra']").value="";
            
            
            
         }
      }
      request.open("POST", "http://pascal.fis.agh.edu.pl/~9rewis/projekt2/rest/save2", true);
      request.send(txt2);

   }
}
function wynik() {
   document.getElementById('noAccessInfo').style.display = 'block';
   var content = "<h3>Lokalna baza:</h3>";
   var conn = window.indexedDB.open("wynik", 2);
   conn.onsuccess = function (event) 
   {
      var db = event.target.result;
      var transaction = db.transaction('answer', 'readwrite');
      var objectStore = transaction.objectStore('answer');
      objectStore.openCursor().onsuccess = function (event) 
      {
         var cursor = event.target.result;
         if (cursor) 
         {  
            var data = {};
            obj=JSON.parse(cursor.value);
            data.age = obj.age;
            data.gra=obj.gra;
            content += "Wiek:  <b>" + data.age + "</b>;  ";
            content += "Ulubiona gra:  <b>" + data.gra + "</b>;  ";
            content += "<br/>"
            cursor.continue();
            console.log(`1 ${content}`);
            document.getElementById('noAccessInfo').innerHTML = content;
         };

      };
   }
}

function analiza()  {

    request = getRequestObject() ;  
    request.onreadystatechange = function() {
       if (request.readyState == 4)    {
          objJSON = JSON.parse(request.response);
           if(objJSON['return'] == 'ok') {
                // document.getElementById('dataBox').style.display = 'block';
                 document.getElementById('myChart').style.display = 'block';
                 document.getElementById('myChart2').style.display = 'block';
                 draw1(objJSON['res']);
                 draw2(objJSON['res']);
                 
                 } else {
                   console.log(request.responseText);
                   
                 }
          }
       }
    
    request.open("GET", "http://pascal.fis.agh.edu.pl/~9rewis/projekt2/rest/getansw", true);
    request.send(null);
 
 }

 function draw1(data){
  
   var x = {};
   x.a1=0;
   x.a2=0;
   x.a3=0;
   x.a4=0;
   x.a5=0;
   for ( var id in data )  {
       for ( var prop in data[id] ) {             
           if ( prop === 'age'){
             var age = parseInt(data[id][prop])
             if(age <= 18){
                 x.a1++;
             }
             else if(age>18 && age <=30){
                 x.a2++;
             }
             else if(age>30 && age <=50){
                 x.a3++;
             }
              else if(age>50 && age <=70){
                 x.a4++;
             }
             else if(age > 70){
                 x.a5++;
             }
          }
        }
     }
     
             
   var options = {
          series: [x.a1, x.a2, x.a3, x.a4, x.a5],
          chart: {
          width: 380,
          type: 'donut',
          background: '#a38f58',
          foreColor: 'ffffff'
        },
        title: {
          text: "1. Ile masz lat? ",
          align: 'left',
          margin: 10,
          offsetX: 0,
          offsetY: 0,
          floating: false,
          style: {
            fontSize:  '14px',
            fontWeight:  'bold',
            fontFamily:  undefined,
            color:  'white'
          },
        },
        labels: [' 0-18', '19-30', '31-50', '50-70', '70+'],
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom',
              color:  'white'
            }
          }
        }]
        
        
        };

        var chart = new ApexCharts(document.querySelector("#myChart"), options);
        
        destroyChart = () => {
              if (chart.ohYeahThisChartHasBeenRendered) {
                  chart.destroy();
                  chart.ohYeahThisChartHasBeenRendered = false;
              }
          };
      document.getElementById('myChart').innerHTML = '';
      chart.render().then(() => chart.ohYeahThisChartHasBeenRendered = true);
        
      
      
 }
 function draw2(data){
  
   var x = {};
   x.a1=0;
   x.a2=0;
   x.a3=0;
   x.a4=0;
   for ( var id in data )  {
       for ( var prop in data[id] ) {             
           if ( prop === 'gra'){
             var age = String(data[id][prop])
             if(age == "Szachy"){
                 x.a1++;
             }
             else if(age == "Warcaby"){
                 x.a2++;
             }
             else if(age == "Inna"){
                 x.a3++;
             }
              else if(age == "Nie gram w gry planszowe"){
                 x.a4++;
             }
             
          }
        }
     }
     
             
   var options = {
          series: [x.a1, x.a2, x.a3, x.a4],
          chart: {
          width: 380,
          type: 'donut',
          background: '#a38f58',
          foreColor: 'ffffff'
        },
        title: {
          text: "2. Twoja ulubiona gra planszowa to ",
          align: 'left',
          margin: 10,
          offsetX: 0,
          offsetY: 0,
          floating: false,
          style: {
            fontSize:  '14px',
            fontWeight:  'bold',
            fontFamily:  undefined,
            color:  'white',
            
          },
        },
        labels: [' Szachy', 'Warcaby', 'Inna', 'Nie gram w gry planszowe'],
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom',
              color:  'white'
            }
          }
        }]
        
        
        };

        var chart = new ApexCharts(document.querySelector("#myChart2"), options);
        
        destroyChart = () => {
              if (chart.ohYeahThisChartHasBeenRendered) {
                  chart.destroy();
                  chart.ohYeahThisChartHasBeenRendered = false;
              }
          };
      document.getElementById('myChart2').innerHTML = '';
      chart.render().then(() => chart.ohYeahThisChartHasBeenRendered = true);
        
      
      
 }

