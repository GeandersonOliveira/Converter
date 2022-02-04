
const myForm = document.getElementById("myForm"); //obtém o form pelo id

myForm.addEventListener("submit", e => { //evento é disparado após o botão submit for acionado
    e.preventDefault();

    var ImagePdf; //variavel que manda request com url para o endpoint 
    var ImagePdfByFile; //variavel que manda request com a imagem para o endpoint 


    const inpFile = document.getElementById("inpFile"); // pega a imagem e manda como form data
    var tamanho = document.getElementById('tamanho').value; //pega o tipo de papel selecionado
    var fileUrl = document.getElementById('file').value; // pega a url da imagem
    var paisagem = document.getElementById('paisagem').checked; //pega a orientação da imagem



    if (document.getElementById('paisagem').disabled == false) { //condicional para mandar o paramentro paisagem para api

        ImagePdf = 'http://localhost:5000/api/ImagePdf' + '?file=' + fileUrl + '&tamanho=' + tamanho + '&paisagem=' + paisagem;
        ImagePdfByFile = 'http://localhost:5000/api/ImagePdfByFile' + '?tamanho=' + tamanho + '&paisagem=' + paisagem;

    } else { //executa 'else' caso o campo paisagem esteja desabilitado (usuario optou por orientação automatica)

        ImagePdf = 'http://localhost:5000/api/ImagePdf' + '?file=' + fileUrl + '&tamanho=' + tamanho; //caminho da api (atenção pode mudar a porta)
        ImagePdfByFile = 'http://localhost:5000/api/ImagePdfByFile' + '?tamanho=' + tamanho; //caminho da api ( atenção pode mudar a porta)
    }




    var caminho; //variaveis caminho da api para o fetch
    var myInit; //parametros para o fetch mandar para api

    if (fileUrl == "" || fileUrl == null) { //condicional para verificar se o usuario optou por subir a imagem ou url , 
        // e entao mandar para o endpoint correto

        caminho = ImagePdfByFile;

        const formData = new FormData();

        console.log(inpFile.files);

        formData.append("inpFile", inpFile.files[0]);

        myInit = {
            method: "post",
            body: formData
        }

    }

    else {

        caminho = ImagePdf;

        myInit = {
            method: "post"
        }
    }


    fetch(caminho, myInit)

        .then(async res => ({ //recebe a resposta como blob da api, e faz o download do arquivo, com o nome File.pdf

            blob: await res.blob()
        }))
        .then(resObj => {
            // It is necessary to create a new blob object with mime-type explicitly set for all browsers except Chrome, but it works for Chrome too.
            const newBlob = new Blob([resObj.blob], { type: 'application/pdf' });

            // MS Edge and IE don't allow using a blob object directly as link href, instead it is necessary to use msSaveOrOpenBlob
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(newBlob);
            } else {
                // For other browsers: create a link pointing to the ObjectURL containing the blob.
                const objUrl = window.URL.createObjectURL(newBlob);

                let link = document.createElement('a');
                link.href = objUrl;
                link.download = "File.pdf";
                link.click();

                // For Firefox it is necessary to delay revoking the ObjectURL.
                setTimeout(() => { window.URL.revokeObjectURL(objUrl); }, 250);
            }
        });

});

function desabilitar(valor) {  // função para implementar o checkbox Usar Url de imagem. Habilitado ele desliga o drop_zone, e habilita o input text que recebe a url da imagem
    var status = document.getElementById('file').disabled;


    if (valor == 'sim' && !status) {
        document.getElementById('file').value = "";
        document.getElementById('file').disabled = true;
        document.getElementById('inpFile').disabled = false;
        document.getElementById('paisagem').disabled = false;



    } else {
        if (document.getElementById('prompt').hidden == true) {

            document.getElementById('thumb').remove();
            document.getElementById('prompt').hidden = false

        }
        document.getElementById('file').disabled = false;
        document.getElementById('inpFile').value = "";
        document.getElementById('inpFile').disabled = true;
    }
}

function rotate() {

    var status = document.getElementById('temp').checked;



    if (status == true) {
        document.getElementById('switch').hidden = true;
        document.getElementById('paisagem').disabled = true;

    } else {
        document.getElementById('switch').hidden = false;
        document.getElementById('paisagem').disabled = false;


    }
} // função que implementa a funcionalidade de orientação automatica, habilitando ou nao o checkbox de orientação paisagem

function resetar() {

    if (document.getElementById('prompt').hidden == true) {

        document.getElementById('thumb').remove();
        document.getElementById('prompt').hidden = false

    }

} // função que reseta os inputs do form


document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {  //função que implementa o input drop_zone, que recebe a imagem , podendo arrastar e mantem uma thumb da imagem.
    const dropZoneElement = inputElement.closest(".drop-zone");

    dropZoneElement.addEventListener("click", (e) => {
        inputElement.click();
    });

    inputElement.addEventListener("change", (e) => {
        if (inputElement.files.length) {
            updateThumbnail(dropZoneElement, inputElement.files[0]);
        }
    });

    dropZoneElement.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZoneElement.classList.add("drop-zone--over");
    });

    ["dragleave", "dragend"].forEach((type) => {
        dropZoneElement.addEventListener(type, (e) => {
            dropZoneElement.classList.remove("drop-zone--over");
        });
    });

    dropZoneElement.addEventListener("drop", (e) => {
        e.preventDefault();

        if (e.dataTransfer.files.length) {
            inputElement.files = e.dataTransfer.files;
            updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }

        dropZoneElement.classList.remove("drop-zone--over");
    });
});
/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail(dropZoneElement, file) {
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

    // First time - remove the prompt
    if (dropZoneElement.querySelector(".drop-zone__prompt")) {
        dropZoneElement.querySelector(".drop-zone__prompt").hidden = true;


    }

    // First time - there is no thumbnail element, so lets create it
    if (!thumbnailElement) {
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");
        thumbnailElement.id = "thumb";
        dropZoneElement.appendChild(thumbnailElement);
    }

    thumbnailElement.dataset.label = file.name;

    // Show thumbnail for image files
    if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
            thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
        };
    } else {
        thumbnailElement.style.backgroundImage = null;
    }
}


