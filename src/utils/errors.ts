export function printErrorsToHtml(err) {
    const { body, response } = err
    const errors = body?.data?.errors || body?.details?.errors

    let toastText = ''
    if (errors && errors.length) {
        const errorItems = errors.map((error) => `<li>${JSON.stringify(error)}</li>`)
        toastText = `<ul>${errorItems.join('\n')}</ul>`
    }

    return toastText
}
