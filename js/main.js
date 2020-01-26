const url = '../docs/pdf.pdf'

let pdfDoc = null
let pageNum = 1
let pageIsRendering = false
let pageNumIsPending = null

const scale = 1.5
const canvas = document.querySelector('#pdf-render')
const ctx = canvas.getContext('2d')
// Render the page
const renderPage = function (num) {
    pageIsRendering = true

    //Get Page
    pdfDoc.getPage(num).then(function (page) {
        const viewport = page.getViewport({ scale: scale })
        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderCtx = {
            canvasContext: ctx,
            viewport: viewport
        }
        
        page.render(renderCtx).promise.then(function () {
            pageIsRendering = false

            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending)
                pageNumIsPending = null
            } 
        })

        // output current page
        document.querySelector('.page-num').textContent = num
    })
}

// Check for pages rendering
const queueRenderPage = function (num) {
    if (pageNumIsPending) {
        pageNumIsPending = num
    } else {
        renderPage(num)
    }
}

// Show prev Page
const showPrevPage = function () {
    if (pageNum <= 1) {
        return
    }

    pageNum--

    queueRenderPage(pageNum)
}

const showNextPage = function () {
    if (pageNum >= pdfDoc.numPages) {
        return
    }

    pageNum++

    queueRenderPage(pageNum)
}
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
// Get Document
pdfjsLib.getDocument(url).promise.then(function (doc) {
    pdfDoc = doc
    document.querySelector('.page-count').textContent = pdfDoc.numPages
    renderPage(pageNum)
})
  .catch(function (err) {
      const div = document.createElement('div')
      div.className = 'error'
      div.appendChild(document.createTextNode(err.message))
      document.querySelector('body').insertBefore(div, canvas)
      document.querySelector('.top-bar').style.display = 'none'
  })

// Button Events
document.querySelector('#prev-page').addEventListener('click', showPrevPage)
document.querySelector('#next-page').addEventListener('click', showNextPage)