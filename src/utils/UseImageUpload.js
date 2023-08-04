import {ref, watch} from "vue";

export function UseImageUpload() {
//image
    let imageFile = ref("");
    let imageUrl = ref("");

    function handleImageSelected(event) {
        console.log("123")
        if (event.target.files.length === 0) {
            imageFile.value = "";
            imageUrl.value = "";
            return;
        }

        imageFile.value = event.target.files[0];
        
    }

    watch(imageFile, (imageFile) => {
        if (!(imageFile instanceof File)) {
            return;
        }

        let fileReader = new FileReader();

        fileReader.readAsDataURL(imageFile);
       
        fileReader.onload = async () => {
           
            imageUrl.value =  fileReader.result.split(",")[1];
           
        }
    });

    return {
        imageFile,
        imageUrl,
        handleImageSelected,
    };
}
