
let app = document.querySelector('#app')

window.getInputValue = function(event){
    event.preventDefault()
    let inputValue = document.getElementById("input-id").value

    if (inputValue!=''){
        logIn(inputValue)
    } else {
        window.alert('El campo de id esta vacio')
    }
    
}

function formatDate(dateISO) {

    let myDate = new Date(dateISO);

    let optionsDate = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
    };

    let optionsHour = { 
        hour: '2-digit', 
        minute: '2-digit', 
        // hour12: true, 
    };

    let formatedDate = myDate.toLocaleDateString('es-ES', optionsDate);
    let formatedHour = myDate.toLocaleTimeString('es-ES', optionsHour);

    return {formatedDate: formatedDate, formatedHour: formatedHour};
}

function formatData(data){

  const grouped = data.reduce((acc, item) => {
    const dateKey = item.start_date.split("T")[0]
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {});
  
  const sortedGrouped = Object.keys(grouped)
    .sort()
    .map(date => ({
      start_date: date,
      elements: grouped[date]
    }));

    return sortedGrouped
}

let dataClasses = {}

function logIn(userId){

    fetch('/log-in', {
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({'userId': userId})})
    .then(response => response.json())
    .then(data => {

        dataClasses = data
        console.log(data)

        if (dataClasses.available.length > 0){

            //formatear array
            let newDataAvailable = formatData(dataClasses.available)
            console.log('available: ', newDataAvailable)

            newDataAvailable.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
            //Llamar funcion para crear container principales
            let container = createContainersAndFilters('avail')
            //Llamar funcion createCards() enviando data para iterar
            createCards(newDataAvailable, container, 'avail')
            addFilterEventListeners()

        } else if (dataClasses.reserved.length > 0){

            //formatear array
            let newDataReserved = formatData(dataClasses.reserved)
            console.log('reserved: ', newDataReserved)

            newDataReserved.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
            //Llamar funcion para crear container principales
            let container = createContainersAndFilters('reserved')
            //Llamar funcion createCards() enviando data para iterar
            createCards(newDataReserved, container, 'reserved')
            addFilterEventListeners()

            } else {
            window.alert("No hay clases disponibles")
        }

    })
}

function addFilterEventListeners(){

    const availRadioButtons = document.getElementById('available');
    availRadioButtons.addEventListener("click", () => {

        removeMainContainer()
        let containerR = createContainersAndFilters('avail')
        //formatear array
        let newDataAvailable = formatData(dataClasses.available)
        console.log('available: ', newDataAvailable)
        createCards(newDataAvailable, containerR, 'avail')

    })

    const reservedRadioButtons = document.getElementById('reserved');
    reservedRadioButtons.addEventListener("click", () => {

        removeMainContainer()
        let containerR = createContainersAndFilters('reserved')
        //formatear array
        let newDataReserved = formatData(dataClasses.reserved)
        console.log('reserved: ', newDataReserved)
        createCards(newDataReserved, containerR, 'reserved')

})

}


function createContainersAndFilters(type){

    let filtersExist = document.body.contains(document.getElementById('reserved'))
    let typeRequest = type
    const appResults = document.getElementById('app')

        // Create main container for filters
        const containerResults = document.createElement('div')
        containerResults.classList.add('main-container-results')
        
        // // Create main container for filters
        // const containerMainFilters = document.createElement('div')
        // containerMainFilters.setAttribute('x-data', 'scheduleFilter()')
        // containerMainFilters.setAttribute('x-init', 'init()')
        // containerMainFilters.classList.add('container-filters-results')
        // containerResults.appendChild(containerMainFilters)


        if (!filtersExist){
            //create radio container filters disponibles or programadas
            const filtersContainer = document.createElement('div')
            filtersContainer.classList.add('radio-inputs')

            //Create filter 1 "available"
            const labelFilter1 = document.createElement('label')
            labelFilter1.classList.add('radio')

            const inputFilter1 = document.createElement('input')
            inputFilter1.type = "radio"
            inputFilter1.name = "radio"
            inputFilter1.id = "available"
            if (typeRequest==='avail') {
                inputFilter1.checked = true
            }

            const spanFilter1 = document.createElement('span')
            spanFilter1.classList.add('name')
            spanFilter1.innerText = "Disponibles"

            labelFilter1.append(inputFilter1, spanFilter1)
            filtersContainer.append(labelFilter1)
            
            //Create filter 2 "programadas"

            const labelFilter2 = document.createElement('label')
            labelFilter2.classList.add('radio')

            const inputFilter2 = document.createElement('input')
            inputFilter2.type = "radio"
            inputFilter2.name = "radio"
            inputFilter2.id = "reserved"
            
            if (typeRequest!='avail') {
                inputFilter2.checked = true
            }

            const spanFilter2 = document.createElement('span')
            spanFilter2.classList.add('name')
            spanFilter2.innerText = "Programadas"

            labelFilter2.append(inputFilter2, spanFilter2)
            filtersContainer.append(labelFilter2)
            
            //agregar a app
            appResults.append(filtersContainer)
        }

        // Create subtitle
        const pageSubtitle = document.createElement('h2')
        pageSubtitle.classList.add('subtitle')

        if (typeRequest==='avail'){
            pageSubtitle.innerText = "Clases disponibles"
        } else {
            pageSubtitle.innerText = "Clases programadas"
        }
        
        containerResults.append(pageSubtitle)

        //Agregar a app
        appResults.append(containerResults)

        //Llamar animacion             
        menuAnimation(containerResults)

        //Llamar funcion createCards() sending data to iterate
        // createCards(data.available, containerResults)

        return containerResults
}


function createCards(data, containerR, typeRequest){    
    // Loop for creating cards
    console.log(data)

    data.forEach((item) => {
      const details = document.createElement('details')
      details.classList.add('details')


      const summary = document.createElement('summary')
      summary.classList.add('summary')
      let formatedDate = formatDate(item.start_date)
      summary.innerText = `Clases para ${formatedDate.formatedDate}`               

      const elements = item.elements

      elements.forEach((element)=>{

          const container = document.createElement('div')
          container.classList.add('container')

          const cardBar = document.createElement('div')
          cardBar.classList.add('card-bar')
          container.append(cardBar)
          
          const cardContainer = document.createElement('div')
          cardContainer.classList.add('card-container')

          // const iconCalendarContainer = document.createElement('div')
          // iconCalendarContainer.classList.add('card-icon-container')
          // iconCalendarContainer.innerHTML = svgData
          
          const cardBodyContainer = document.createElement('div')
          cardBodyContainer.classList.add('card-body-container')
  
          const title = document.createElement('h3')
          title.classList.add('card-title')
          title.innerText = element.teacher_name
  
          const classDate = document.createElement('p')
          classDate.classList.add('card-body')
          let formatedDate = formatDate(element.start_date)
          classDate.innerText = `El ${formatedDate.formatedDate} a las ${formatedDate.formatedHour} hora Colombia` 
         
          cardBodyContainer.append(title, classDate)
          cardContainer.append(cardBodyContainer)
          container.append(cardContainer)
          details.append(container)

          if (typeRequest==='avail'){
            const spanButton = document.createElement('div')
            spanButton.classList.add('card-span-button')
            spanButton.innerText = 'Registrar'
            cardContainer.append(spanButton)
        }

      })

      details.append(summary)
      containerR.append(details)  
      
    })
    var arrowButton = document.querySelector('.arrow')
    arrowButton.style.display = 'block'
}

function menuAnimation(){
    let w = window.innerWidth
    let animationY = -300

    if (w<500) {
        animationY = -400
    } 

    let myAnimation = anime({
        targets: ['.main-container', '.availabilityApp'],
        translateY: animationY,
        duration: 3000
    })
}

let arrow = document.getElementById('arrow-down')

arrow.addEventListener("click", (e) => {
    menuAnimationOut()
  });

function menuAnimationOut(){
    let myAnimation = anime({
        targets: ['.main-container'],
        translateY: 0,
        duration: 3000
    })
    let filtersContainer = document.querySelector('.radio-inputs')
    filtersContainer.remove()

    removeMainContainer()

    let arrowButton = document.querySelector('.arrow')
    arrowButton.style.display = 'none'

}

async function createButton() {
    const response = await fetch('/static/icons/calendar_icon.html')
    const data = await response.text()
    return data
  }

function removeMainContainer(){
    let availabilityContainer = document.querySelector('.main-container-results')
    availabilityContainer.remove()
}

