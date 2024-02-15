import { Editor } from '@tinymce/tinymce-react'
import React from 'react'
function EditorText({label,editorRef,id,initialValue = ""}) {
  return (
    <>
        <span className='text-sm mb-1 block dark:text-white text-placeholder'>{label}</span>
        <Editor
            apiKey='6fbtqt9m6xugsl9q2dfx6oyrvdubr7oxo4d2gbzy3dkomci9'
            onInit={(evt, editor) => editorRef.current = editor}
            initialValue={!initialValue ? "" : initialValue}
            id={id}
            init={{
              language:'es',
              branding:false,
              height: 300,
              menubar: false,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
        />
    </>
  )
}

export default EditorText