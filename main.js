/*Опишу дії, що реалізував (можливо невірно зрозумів завдання)
* 0 - Об'єкти поки не робив, реалізацію намагався зробити як найпростіше
* 1- Формуємо списки кнопок та блоків контенту для табів
* 2 - перебираємо кнопки і додаємо обробники подій для них
* 3-прибираємо статус активних у всіх кнопок і контенту
* 4- додаємо актив для натиснутої кнопки, отримуємо актив для натиснутої кнопки
* 5-заходимо секцію з відповіним id і відображаємо її
* Якщо не зовнсім раціонально підкажіть будь ласка кращий шлях
* */
document.addEventListener('DOMContentLoaded', () => {

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {

            tabButtons.forEach(btn => btn.classList.remove('active'));

            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');

            const targetTab = button.getAttribute('data-tab');

            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

});