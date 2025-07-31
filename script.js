// Intialise supabase
const supabaseUrl = "https://myckkdbbubykahjyxoap.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Y2trZGJidWJ5a2Foanl4b2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5Mzc2MzMsImV4cCI6MjA2NjUxMzYzM30.-AW2H3DNpkM3OxXUtjJXTZvvw8We9-c5x4HjJDz5GJc"


const supabase = window.supabase.createClient(supabaseUrl, supabaseKey, {
    db: {
        schema:"public"
    }
})

// Get modal elements
const modal = document.getElementById('itemModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const backBtn = document.querySelector('.back-btn');
const form = document.getElementById('addItemForm');
const quantityInput = document.getElementById('quantity');

let editIndex = null;

// Initialize an array of food objects
let foods = [
    {
        name:"Pizza",
        expiryCounter:7,
        notes: "Has cheese",
        tag:"Food",
        quantity:1,
        imageUrl: "https://www.tasteofhome.com/wp-content/uploads/2018/01/Homemade-Pizza_EXPS_FT23_376_EC_120123_3.jpg"
    },
    {
        name:"Milo",
        expiryCounter:4,
        notes: "",
        tag:"Drink",
        quantity:3,
        imageUrl: "https://www.greedygirlgourmet.com/wp-content/uploads/2023/03/iced-milo-drink-recipe.jpg"
    },
    {
        name:"Milk",
        expiryCounter:7,
        notes: "Has cheese",
        tag:"Drink",
        quantity:1,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Glass_of_Milk_%2833657535532%29.jpg/1200px-Glass_of_Milk_%2833657535532%29.jpg"
    },
    {
        name:"Potato Buns",
        expiryCounter:4,
        notes: "",
        tag:"Food",
        quantity:3,
        imageUrl: "https://handletheheat.com/wp-content/uploads/2016/02/Potato-Buns-Square.jpg"
    },
]

// On page load, initialize localStorage if not present, and sync global foods array
if (!localStorage.getItem('foods')) {
    localStorage.setItem('foods', JSON.stringify(foods));
} else {
    foods = JSON.parse(localStorage.getItem('foods'));
}

async function handleDelete(id){
    // // Remove the item from the foods array using the provided id
    // foods = foods.filter((food, index) => index !== id);
    // // Update localStorage
    // localStorage.setItem('foods', JSON.stringify(foods));
    await deleteFridgeItem(id)
    // Re-display the updated list
    displayCards();
}

async function deleteFridgeItem(id) {
    try {
        const { error } = await supabase
            .from("fridge_items")
            .delete()
            .eq("id", id)

        if (error) {
            console.log("Delete error:", error.message)
        } else {
            console.log("Fridge item deleted successfully")
            // Refresh the list to show updated todos
            fetchToDos2()
        }
    } catch (error) {
        console.log("Error in deleting fridge item:", error)
    }
}



async function displayCards(){
    // Get the parent container
    const foodList = document.getElementById('food-list')
    // Clear the foodList first before populating new data
    foodList.innerHTML = ``

    // Get the foods data from local storage, handle null gracefully
    // const localStorageFoods = JSON.parse(localStorage.getItem('foods')) || [];
    // console.log('localStorageFoods',localStorageFoods)
    // const supabaseStorageFoods = fetchFood()
    // console.log("supabase food", supabaseStorageFoods)

    foods = await fetchFood()
    console.log("foods value initial", foods)
    foods.forEach((food,index)=>{
        // Create the child HTML element
        const foodCard = `
        <div class="card" id="${food.id}">
            <img src="${food.imageUrl}" alt="${food.name}" class="food-img" />
            <div class="card-content">
            <h2>${food.name}</h2>
            <p class="expiry">Expires in <span class="highlight">${food.expiryCounter}</span> days</p>
            <p class="note">${food.notes}</p>
            <div class="tags">
                <span class="tag red">🍽️ ${food.tag}</span>
                <span class="tag gray">🛒 ${food.quantity}</span>
            </div>
            <div class="actions">
                <button class="delete-btn" onclick="handleDelete(${food.id})">🗑️ Delete</button>
                <button class="edit-btn" onclick="editFood(${food.id})">✏️ Edit</button>
            </div>
            </div>
      </div>
        `
        // Add the new element to existing parent
        foodList.innerHTML += foodCard
    })
}

function addFood(food){
    // Get foods from localStorage, or empty array if not present
    let localStorageFoods = JSON.parse(localStorage.getItem('foods')) || [];
    localStorageFoods.push(food);
    // Update localStorage and global foods array
    localStorage.setItem('foods', JSON.stringify(localStorageFoods));
    foods = localStorageFoods;
    // Display all food after new item added
    displayCards();
}

// Open modal function
function openModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
}

// Close modal function
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
    // Reset image placeholder
    const placeholder = document.querySelector('.image-placeholder');
    if (placeholder) {
        placeholder.innerHTML = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"></line><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line></svg>`;
    }
}

// Event listeners for opening and closing the modal
openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
backBtn.addEventListener('click', closeModal);

// Close modal when clicking outside the modal content
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// Form submission
form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    // Get form values
    const itemName = document.getElementById('name').value
    const quantity = document.getElementById('quantity').value
    const expiryDate = document.getElementById('expiryDate').value
    const category = document.getElementById('category').value
    const notes = document.getElementById('notes').value
    
    // Here you would typically send this data to a server or store it locally
    console.log('Added item:',itemName, quantity, expiryDate, category, notes)

    // Close the modal after submission
    closeModal()

    // Optional: Reset form
    form.reset()

    // Calculate expiry date
    const differenceInMilliseconds = new Date (expiryDate) - new Date()
    const differenceInDays = differenceInMilliseconds/(1000 * 60 * 60 * 24)
    const daysLeft = Math.ceil(differenceInDays)

    // Create an object
    const food = {
        name: itemName,
        quantity:quantity,
        expiryCounter: daysLeft,
        tag:category,
        notes:notes,
        imageUrl: modalImageUrl
    }

    // If-else
    // If editIndex !== null
    // Update the food array (based on the id)

    if (editIndex !== null){
        foods[editIndex] = food;
        // Update localStorage after edit
        localStorage.setItem('foods', JSON.stringify(foods));
        console.log('current food',foods[editIndex])
        // reset editIndex to null since we're done editing
        editIndex = null
        displayCards()
    } else{
        // Pass the object into the addFood function
        addFood(food)
    }
});

let modalImageUrl = ""
function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

function getImageUrl() {
    if (isMobileDevice()) {
        // Trigger file input on mobile
        document.getElementById('fileInput').click();
    } else {
        // Desktop: use URL prompt
        const url = prompt('Please enter your image URL');
        if (url) {
            updatePlaceholder(url);
        }
   }
}

// Handle file input change (for mobile)
document.getElementById('fileInput').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = function () {
        const base64String = reader.result;
        updatePlaceholder(base64String);
        console.log("Base64 Image:", base64String); // You can store this
    };
    reader.readAsDataURL(file);
});

// Reusable function to update the image placeholder
function updatePlaceholder(src) {
    const placeholder = document.querySelector('.image-placeholder');
    if (placeholder) {
        placeholder.innerHTML = `<img src="${src}" alt="Uploaded Image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
        modalImageUrl = src
    }
}

// When website finish loading, display cards
window.addEventListener('load',()=>{
    displayCards();
    // Reset modal image placeholder to SVG on modal close
    document.getElementById('itemModal').addEventListener('hide', () => {
        const placeholder = document.querySelector('.image-placeholder');
        if (placeholder) {
            placeholder.innerHTML = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"></line><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line></svg>`;
        }
    });
});

function addToLocalStorage(){
    // We use JSON.stringify() when storing objects into local storage
    localStorage.setItem('foods',JSON.stringify(foods))
}

// function removeFromLocalStorage(){
//     localStorage.removeItem('food')
// }

// function getFromLocalStorage(){
//     const food = localStorage.getItem('food')
//     console.log('the food is',food)
// }

// Add 7 days
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 7);
console.log(futureDate)
// Get the timestamp
const futureTimestamp = futureDate.getTime();
console.log(futureTimestamp)

async function fetchFood() {
    try{
        const {data, error} = await supabase.from("fridge_items").select("*")
           
        console.log("data from fridge items", data)
        // const foodList = document.getElementById('food-list')
        // foodList.innerHTML = ""
        // data.forEach((todo)=>{
        //     const li = document.createElement('li')
        //     // Checked property is handled by ternary operator
        //     // e.g todo.is_completed == true? "checked":""
        //     // condition? true result: false result
        //     li.innerHTML = `
        //     <li>
        //         <input type="checkbox" name="todo-${todo.id}" id="todo-${todo.id}" ${todo.is_completed == true? "checked":""}>
        //         <label for="todo-${todo.id}">${todo.title}</label>
        //         <p><i>${todo.description}</i></p>
        //     </li>
        //     `
        //     foodList.appendChild(li)
        // })
        // Set the foods array values from supabase
        foods = data
        console.log("foods from supabase", data)
        return data
    } catch(error) {
        console.error(`Error fetching items;" ${error}`)
    }
}

fetchFood()

async function addFood(food) {
    // Destructure the object
    const { name, notes, expiryCounter, tag, quantity, imageUrl} = food


    // Insert the todos data into supabase
    const {data,error} = await supabase
        .from('fridge_items')
        .insert([
            {
            name: name,
            notes: notes,
            expiryCounter: expiryCounter,
            tag: tag,
            quantity: quantity,
            imageUrl: imageUrl
            }
        ])
        .select("*")
        

    // Log any errors if detected
    if (error) {
        console.error("Insert failed:", error.message)
    } else {
        console.log('Todo added:', data)
    }
    displayCards()
}

async function editFood(food) {
    // Get the existing todo details (based on id)
    let originalName = null
    let originalNotes = null
    let originalExpiryCounter = null
    let originalTag = null
    let originalQuantity = null
    let originalImageUrl = null

    // Get the updated details
    try{
        // Get details from Supabase by matching ID
        const { error, data } = await supabase
        .from('fridge_items')
        .select("*")
        .eq("id", )
        .single();
        

        if(error){
            console.log('error', error.message)
        } else {
            const { name, notes, expiryCounter, tag, quantity, imageUrl} = data
            
        }
    } catch(error) {
        console.log("Error in editing todo", error.message)
    }
    // Shopw existing info to yser
    const newTitle = prompt("Update title", title)
    const newDescription = prompt("Update description", description)
    const newIsCompleted = prompt("Update completion", is_completed)
    // Update to Supabase
    const { data: updateData, error: updateError } = await supabase
        .from('todos')
        .update({
        title: newTitle || title,
        description: newDescription || description,
        is_completed: newIsCompleted || is_completed
        
})
    .select("*")

    if(updateError){
        console.log("update error", updateError.message)
    } else {
        console.log("update data successfully", updateData)
    }

    // (Refresh the list)
}


// Attach the current food items to the data from supabase instwad (work with fetchFood())
// Try to do delete version