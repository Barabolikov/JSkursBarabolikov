class Student {
    constructor(id, fullName, group, course, specialty, avgGrade, funding) {
        this.id = id; this.fullName = fullName; this.group = group;
        this.course = course; this.specialty = specialty;
        this.avgGrade = avgGrade; this.funding = funding;
    }
    getValues() { return [this.id, this.fullName, this.group, this.course, this.specialty, this.avgGrade, this.funding]; }
}

class Teacher {
    constructor(id, fullName, department, position, degree, experience, rate) {
        this.id = id; this.fullName = fullName; this.department = department;
        this.position = position; this.degree = degree; this.experience = experience; this.rate = rate;
    }
    getValues() { return [this.id, this.fullName, this.department, this.position, this.degree, this.experience, this.rate]; }
}

class Subject {
    constructor(id, title, hours, credits, controlType, semester, type) {
        this.id = id; this.title = title; this.hours = hours;
        this.credits = credits; this.controlType = controlType; this.semester = semester; this.type = type;
    }
    getValues() { return [this.id, this.title, this.hours, this.credits, this.controlType, this.semester, this.type]; }
}

class Tab {
    constructor(id, label) {
        this.id = id; this.label = label; this.element = null;
    }
    render() {
        this.element = document.createElement('button');
        this.element.className = 'tab-button';
        this.element.textContent = this.label;
        return this.element;
    }
}

class Content {
    constructor(id, title, headers, itemsData, EntityClass) {
        this.id = id;
        this.title = title;
        this.headers = headers;
        this.itemsData = itemsData;
        this.EntityClass = EntityClass;
        this.element = null;
        this.tbody = null;
        this.modalOverlay = null;
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'tab-content';
        this.element.id = this.id;

        const heading = document.createElement('h2');
        heading.textContent = this.title;
        this.element.appendChild(heading);

        const addBtn = document.createElement('button');
        addBtn.textContent = '➕ Додати запис';
        addBtn.className = 'add-btn';
        this.element.appendChild(addBtn);

        this.createModal();
        addBtn.addEventListener('click', () => { this.modalOverlay.style.display = 'flex'; });

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');

        this.headers.forEach(headText => {
            const th = document.createElement('th');
            th.textContent = headText;
            trHead.appendChild(th);
        });

        // НОВЕ: Додаємо заголовок колонки "Дії"
        const thAction = document.createElement('th');
        thAction.textContent = "Дії";
        trHead.appendChild(thAction);

        thead.appendChild(trHead);
        table.appendChild(thead);

        this.tbody = document.createElement('tbody');
        this.itemsData.forEach(item => { this.appendRow(item); });
        table.appendChild(this.tbody);

        this.element.appendChild(table);
        return this.element;
    }

    createModal() {
        this.modalOverlay = document.createElement('div');
        this.modalOverlay.className = 'modal-overlay';
        this.modalOverlay.style.display = 'none';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content-box';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.modalOverlay.style.display = 'none';

        const modalTitle = document.createElement('h3');
        modalTitle.textContent = `Додати новий запис: ${this.title}`;

        const form = this.createForm();

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(modalTitle);
        modalContent.appendChild(form);
        this.modalOverlay.appendChild(modalContent);
        document.body.appendChild(this.modalOverlay);

        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) this.modalOverlay.style.display = 'none';
        });
    }

    createForm() {
        const form = document.createElement('form');
        form.className = 'data-form';
        const inputs = [];

        for (let i = 1; i < this.headers.length; i++) {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            const label = document.createElement('label');
            label.textContent = this.headers[i] + ':';
            const input = document.createElement('input');
            input.type = 'text';
            input.required = true;

            formGroup.appendChild(label);
            formGroup.appendChild(input);
            form.appendChild(formGroup);
            inputs.push(input);
        }

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.textContent = 'Зберегти запис';
        submitBtn.className = 'submit-btn';
        form.appendChild(submitBtn);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const maxId = this.itemsData.length > 0 ? Math.max(...this.itemsData.map(item => item.id)) : 0;
            const newId = maxId + 1;
            const values = inputs.map(input => input.value);
            const newItem = new this.EntityClass(newId, ...values);

            this.itemsData.push(newItem);
            this.appendRow(newItem);
            form.reset();
            this.modalOverlay.style.display = 'none';
        });

        return form;
    }

    appendRow(item) {
        const tr = document.createElement('tr');
        const objectKeys = Object.keys(item); // Отримуємо масив ключів об'єкта (id, fullName і т.д.)

        item.getValues().forEach((value, index) => {
            const td = document.createElement('td');
            td.textContent = value;

            // НОВЕ: Робимо клікабельними всі колонки, крім першої (ID)
            if (index > 0) {
                td.title = "Клікніть, щоб редагувати";
                td.className = "editable-cell";
                td.addEventListener('click', () => this.makeCellEditable(td, item, objectKeys[index]));
            }
            tr.appendChild(td);
        });

        // НОВЕ: Створюємо колонку з кнопкою Видалення
        const tdAction = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '&#10060;'; // Хрестик ❌
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = "Видалити рядок";

        deleteBtn.addEventListener('click', () => this.handleDelete(item, tr));

        tdAction.appendChild(deleteBtn);
        tr.appendChild(tdAction);

        this.tbody.appendChild(tr);
    }

    // --- МЕТОД ДЛЯ РЕДАГУВАННЯ ДАНИХ У КОМІРЦІ ---
    makeCellEditable(td, item, propertyKey) {
        // Якщо всередині вже є input, нічого не робимо
        if (td.querySelector('input')) return;

        const currentValue = td.textContent;
        td.textContent = ''; // Очищаємо текст комірки

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.className = 'inline-edit-input';

        td.appendChild(input);
        input.focus(); // Ставимо курсор у поле

        // Функція збереження
        const saveEdit = () => {
            // Щоб уникнути подвійного спрацювання
            if (!td.contains(input)) return;
            const newValue = input.value.trim();
            td.textContent = newValue; // Оновлюємо інтерфейс
            item[propertyKey] = newValue; // Оновлюємо об'єкт у пам'яті!
        };

        // Зберігаємо, якщо клікнули поза полем
        input.addEventListener('blur', saveEdit);

        // Зберігаємо, якщо натиснули Enter
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
    }

    // --- МЕТОД ДЛЯ ВИДАЛЕННЯ З ПЕРЕВІРКОЮ ЗВ'ЯЗКІВ ---
    handleDelete(item, tr) {
        // СИМУЛЯЦІЯ: Перевірка, чи не прив'язані дані до інших таблиць
        // Забороняємо видаляти Викладача з ID=1 та Дисципліну з ID=1
        if ((item instanceof Teacher && item.id === 1) || (item instanceof Subject && item.id === 1)) {
            showErrorPopup(`Помилка! Запис "${item.fullName || item.title}" вже використовується в іншій таблиці. Видалення неможливе.`);
            return;
        }

        // Якщо перевірку пройдено, питаємо підтвердження і видаляємо
        if (confirm("Ви дійсно бажаєте видалити цей рядок?")) {
            this.itemsData = this.itemsData.filter(i => i.id !== item.id); // Видаляємо з масиву
            tr.remove(); // Видаляємо з HTML
        }
    }
}

class TabSystem {
    constructor(tabsContainerId, contentContainerId) {
        this.tabsContainer = document.getElementById(tabsContainerId);
        this.contentContainer = document.getElementById(contentContainerId);
        this.tabs = [];
        this.contents = [];
    }

    addSection(tab, content) {
        this.tabs.push(tab);
        this.contents.push(content);
        this.tabsContainer.appendChild(tab.render());
        this.contentContainer.appendChild(content.render());
        tab.element.addEventListener('click', () => this.activate(tab.id));
    }

    activate(activeId) {
        this.tabs.forEach(t => t.id === activeId ? t.element.classList.add('active') : t.element.classList.remove('active'));
        this.contents.forEach(c => c.id === activeId ? c.element.classList.add('active') : c.element.classList.remove('active'));
    }

    init() {
        if (this.tabs.length > 0) this.activate(this.tabs[0].id);
    }
}

// --- ГЛОБАЛЬНА ФУНКЦІЯ: ПОПАП ДЛЯ ПОМИЛОК ВИДАЛЕННЯ ---
function showErrorPopup(message) {
    // Якщо попап вже є, просто змінюємо текст і показуємо
    let errorModal = document.getElementById('error-modal');
    if (!errorModal) {
        errorModal = document.createElement('div');
        errorModal.id = 'error-modal';
        errorModal.className = 'modal-overlay';

        const box = document.createElement('div');
        box.className = 'modal-content-box error-box';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => errorModal.style.display = 'none';

        const title = document.createElement('h3');
        title.style.color = '#e74c3c';
        title.textContent = 'Увага! Обмеження бази даних';

        const msgText = document.createElement('p');
        msgText.id = 'error-modal-msg';

        box.appendChild(closeBtn);
        box.appendChild(title);
        box.appendChild(msgText);
        errorModal.appendChild(box);
        document.body.appendChild(errorModal);

        errorModal.addEventListener('click', (e) => {
            if (e.target === errorModal) errorModal.style.display = 'none';
        });
    }

    document.getElementById('error-modal-msg').textContent = message;
    errorModal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {

    const students = [
        new Student(1, "Пилипенко Микола Іванович", "721", 2, "F3 Комп'ютерні науки", 4.5, "Бюджет"),
        new Student(2, "Микуленко Дмитро Петрович", "741", 4, "F2 Інженерія ПЗ", 4.8, "Бюджет"),
        new Student(3, "Криволап Анастасія Петрівна", "121", 2, "G19 Будівництво та цивільна інженерія", 2.6, "Бюджет"),
        new Student(4, "Проскурня Валентина Дмитрівна", "121", 2, "G19 Будівництво та цивільна інженерія", 3.5, "Контракт"),
        new Student(5, "Забіяка Сніжана Павлівна", "141", 4, "G19 Будівництво та цивільна інженерія", 4.3, "Контракт")
    ];

    const teachers = [
        new Teacher(1, "Дмитренко Поліна Кирилівна", "Програмування", "Доцент", "К.т.н.", 15, "1.0"),
        new Teacher(2, "Клименко Антоніна Павлівна", "Веб програмування", "Старший викладач", "-", 8, "0.5")
    ];

    const subjects = [
        new Subject(1, "Основи програмування", 120, 4, "Екзамен", 1, "Обов'язкова"),
        new Subject(2, "Веб дизайн", 90, 3, "Залік", 3, "Обов'язкова"),
        new Subject(3, "Математика", 240, 8, "Екзамен", 3, "Обов'язкова"),
    ];

    const tabSystem = new TabSystem('tabs-container', 'content-container');

    tabSystem.addSection(new Tab('tab-students', 'Студенти'), new Content('tab-students', 'Список студентів', ['ID', 'ПІБ', 'Група', 'Курс', 'Спеціальність', 'Середній бал', 'Форма'], students, Student));
    tabSystem.addSection(new Tab('tab-teachers', 'Викладачі'), new Content('tab-teachers', 'Список викладачів', ['ID', 'ПІБ', 'Кафедра', 'Посада', 'Ступінь', 'Стаж', 'Ставка'], teachers, Teacher));
    tabSystem.addSection(new Tab('tab-subjects', 'Дисципліни'), new Content('tab-subjects', 'Перелік дисциплін', ['ID', 'Назва', 'Години', 'ECTS', 'Контроль', 'Семестр', 'Тип'], subjects, Subject));

    tabSystem.init();
});