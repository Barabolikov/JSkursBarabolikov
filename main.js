// ==========================================
// 1. КЛАСИ СУТНОСТЕЙ
// ==========================================
class Student {
    constructor(id, fullName, group, course, specialty, avgGrade, funding) {
        this.id = id; this.fullName = fullName; this.group = group;
        this.course = course; this.specialty = specialty;
        this.avgGrade = avgGrade; this.funding = funding;
    }
    getValues() { return [this.id, this.fullName, this.group, this.course, this.specialty, this.avgGrade, this.funding]; }
}

// ЗМІНА: Замість "Кафедра" тепер "Дисципліна" (subject) для демонстрації списку
class Teacher {
    constructor(id, fullName, subject, position, degree, experience, rate) {
        this.id = id; this.fullName = fullName; this.subject = subject;
        this.position = position; this.degree = degree; this.experience = experience; this.rate = rate;
    }
    getValues() { return [this.id, this.fullName, this.subject, this.position, this.degree, this.experience, this.rate]; }
}

class Subject {
    constructor(id, title, hours, credits, controlType, semester, type) {
        this.id = id; this.title = title; this.hours = hours;
        this.credits = credits; this.controlType = controlType; this.semester = semester; this.type = type;
    }
    getValues() { return [this.id, this.title, this.hours, this.credits, this.controlType, this.semester, this.type]; }
}

// ==========================================
// 2. КЛАСИ ІНТЕРФЕЙСУ
// ==========================================
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
    // Додано onDataChange - функція, яка викликатиметься після будь-якої зміни для збереження
    constructor(id, title, headers, itemsData, EntityClass, onDataChange) {
        this.id = id;
        this.title = title;
        this.headers = headers;
        this.itemsData = itemsData;
        this.EntityClass = EntityClass;
        this.onDataChange = onDataChange;
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

        const thAction = document.createElement('th');
        thAction.textContent = "Дії";
        trHead.appendChild(thAction);

        thead.appendChild(trHead);
        table.appendChild(thead);

        this.tbody = document.createElement('tbody');
        this.renderTableBody(); // Винесено в окремий метод для зручного оновлення
        table.appendChild(this.tbody);

        this.element.appendChild(table);
        return this.element;
    }

    renderTableBody() {
        this.tbody.innerHTML = ''; // Очищаємо таблицю перед малюванням
        this.itemsData.forEach(item => { this.appendRow(item); });
    }

    // Метод для повного оновлення даних ззовні (при синхронізації вкладок)
    refreshData(newData) {
        this.itemsData = newData;
        if (this.tbody) this.renderTableBody();
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
            const headerText = this.headers[i];
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            const label = document.createElement('label');
            label.textContent = headerText + ':';

            let input;

            // ЗМІНА 4-го ЗАВДАННЯ: Якщо це таблиця Викладачів і поле Дисципліна, малюємо <select>
            if (this.title === 'Список викладачів' && headerText === 'Дисципліна') {
                input = document.createElement('select');
                // Тягнемо актуальні дисципліни з localStorage
                const subjects = JSON.parse(localStorage.getItem('erp_subjects')) || [];
                subjects.forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = sub.title;
                    opt.textContent = sub.title;
                    input.appendChild(opt);
                });
            } else {
                input = document.createElement('input');
                input.type = 'text';
            }

            input.required = true;
            input.className = 'form-control-input'; // Єдиний клас для стилізації

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
            this.renderTableBody();
            this.onDataChange(); // ЗБЕРІГАЄМО ЛОКАЛЬНО

            form.reset();
            this.modalOverlay.style.display = 'none';
        });

        return form;
    }

    appendRow(item) {
        const tr = document.createElement('tr');
        const objectKeys = Object.keys(item);

        item.getValues().forEach((value, index) => {
            const td = document.createElement('td');
            td.textContent = value;

            if (index > 0) {
                td.title = "Клікніть, щоб редагувати";
                td.className = "editable-cell";
                // Передаємо також назву колонки (header)
                td.addEventListener('click', () => this.makeCellEditable(td, item, objectKeys[index], this.headers[index]));
            }
            tr.appendChild(td);
        });

        const tdAction = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '&#10060;';
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = "Видалити рядок";

        deleteBtn.addEventListener('click', () => this.handleDelete(item));
        tdAction.appendChild(deleteBtn);
        tr.appendChild(tdAction);
        this.tbody.appendChild(tr);
    }

    makeCellEditable(td, item, propertyKey, headerText) {
        if (td.querySelector('.form-control-input')) return;

        const currentValue = td.textContent;
        td.textContent = '';

        let input;

        // ЗМІНА 4-го ЗАВДАННЯ: Inline-редагування також стає випадним списком
        if (this.title === 'Список викладачів' && headerText === 'Дисципліна') {
            input = document.createElement('select');
            const subjects = JSON.parse(localStorage.getItem('erp_subjects')) || [];
            subjects.forEach(sub => {
                const opt = document.createElement('option');
                opt.value = sub.title;
                opt.textContent = sub.title;
                if (sub.title === currentValue) opt.selected = true; // Виділяємо поточне значення
                input.appendChild(opt);
            });
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.value = currentValue;
        }

        input.className = 'inline-edit-input form-control-input';
        td.appendChild(input);
        input.focus();

        const saveEdit = () => {
            if (!td.contains(input)) return;
            const newValue = input.value.trim();
            td.textContent = newValue;
            item[propertyKey] = newValue;
            this.onDataChange(); // ЗБЕРІГАЄМО ЛОКАЛЬНО ПРИ РЕДАГУВАННІ
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
    }

    handleDelete(item) {
        // РЕАЛЬНА ПЕРЕВІРКА ЗВ'ЯЗКІВ (Замість симуляції)
        if (item instanceof Subject) {
            // Отримуємо поточний список викладачів з localStorage
            const teachers = JSON.parse(localStorage.getItem('erp_teachers')) || [];

            // Перевіряємо, чи є хоча б один викладач, у якого вказана ця дисципліна
            const isUsed = teachers.some(t => t.subject === item.title);

            if (isUsed) {
                showErrorPopup(`Помилка! Дисципліну "${item.title}" неможливо видалити, оскільки вона призначена одному або декільком викладачам.`);
                return; // Зупиняємо видалення
            }
        }

        // Стандартне видалення для всіх інших випадків (або якщо перевірку пройдено)
        if (confirm("Ви дійсно бажаєте видалити цей рядок?")) {
            // Безпечне видалення з масиву
            const idx = this.itemsData.findIndex(i => i.id === item.id);
            if (idx !== -1) {
                this.itemsData.splice(idx, 1);
                this.renderTableBody();
                this.onDataChange(); // ЗБЕРІГАЄМО ЛОКАЛЬНО
            }
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

function showErrorPopup(message) {
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

// ==========================================
// 3. ІНІЦІАЛІЗАЦІЯ ТА LOCAL STORAGE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    // Ключі для localStorage
    const KEYS = { s: 'erp_students', t: 'erp_teachers', sub: 'erp_subjects' };

    // Функція зчитування даних (якщо порожньо - створює початкові)
    function loadData() {
        let lsStudents = JSON.parse(localStorage.getItem(KEYS.s));
        let lsTeachers = JSON.parse(localStorage.getItem(KEYS.t));
        let lsSubjects = JSON.parse(localStorage.getItem(KEYS.sub));

        if (!lsStudents || !lsTeachers || !lsSubjects) {
            // Початкове заповнення, якщо користувач зайшов вперше
            lsStudents = [
                new Student(1, "Пилипенко Микола Іванович", "721", 2, "F3 Комп'ютерні науки", 4.5, "Бюджет"),
                new Student(2, "Микуленко Дмитро Петрович", "741", 4, "F2 Інженерія ПЗ", 4.8, "Бюджет")
            ];
            lsTeachers = [
                new Teacher(1, "Дмитренко Поліна Кирилівна", "Основи програмування", "Доцент", "К.т.н.", 15, "1.0"),
                new Teacher(2, "Клименко Антоніна Павлівна", "Веб дизайн", "Старший викладач", "-", 8, "0.5")
            ];
            lsSubjects = [
                new Subject(1, "Основи програмування", 120, 4, "Екзамен", 1, "Обов'язкова"),
                new Subject(2, "Веб дизайн", 90, 3, "Залік", 3, "Обов'язкова")
            ];
            saveData(lsStudents, lsTeachers, lsSubjects);
        } else {
            // Відновлення об'єктів класів з JSON
            lsStudents = lsStudents.map(x => new Student(x.id, x.fullName, x.group, x.course, x.specialty, x.avgGrade, x.funding));
            lsTeachers = lsTeachers.map(x => new Teacher(x.id, x.fullName, x.subject, x.position, x.degree, x.experience, x.rate));
            lsSubjects = lsSubjects.map(x => new Subject(x.id, x.title, x.hours, x.credits, x.controlType, x.semester, x.type));
        }
        return { lsStudents, lsTeachers, lsSubjects };
    }

    // Функція збереження в localStorage
    function saveData(s, t, sub) {
        localStorage.setItem(KEYS.s, JSON.stringify(s));
        localStorage.setItem(KEYS.t, JSON.stringify(t));
        localStorage.setItem(KEYS.sub, JSON.stringify(sub));
    }

    let data = loadData();

    // Функція, яка викликатиметься класами Content при будь-якій зміні
    const handleDataChange = () => {
        saveData(data.lsStudents, data.lsTeachers, data.lsSubjects);
    };

    const tabSystem = new TabSystem('tabs-container', 'content-container');

    const contentStudents = new Content('tab-students', 'Список студентів', ['ID', 'ПІБ', 'Група', 'Курс', 'Спеціальність', 'Середній бал', 'Форма'], data.lsStudents, Student, handleDataChange);
    const contentTeachers = new Content('tab-teachers', 'Список викладачів', ['ID', 'ПІБ', 'Дисципліна', 'Посада', 'Ступінь', 'Стаж', 'Ставка'], data.lsTeachers, Teacher, handleDataChange);
    const contentSubjects = new Content('tab-subjects', 'Перелік дисциплін', ['ID', 'Назва', 'Години', 'ECTS', 'Контроль', 'Семестр', 'Тип'], data.lsSubjects, Subject, handleDataChange);

    tabSystem.addSection(new Tab('tab-students', 'Студенти'), contentStudents);
    tabSystem.addSection(new Tab('tab-teachers', 'Викладачі'), contentTeachers);
    tabSystem.addSection(new Tab('tab-subjects', 'Дисципліни'), contentSubjects);

    tabSystem.init();

    // СИНХРОНІЗАЦІЯ ВКЛАДОК: Слухаємо зміни з інших вкладок браузера
    window.addEventListener('storage', (e) => {
        if (e.key === KEYS.s || e.key === KEYS.t || e.key === KEYS.sub) {
            // Якщо щось змінилось у сусідній вкладці, завантажуємо нові дані...
            data = loadData();
            // ...і просимо таблиці перемалюватися
            contentStudents.refreshData(data.lsStudents);
            contentTeachers.refreshData(data.lsTeachers);
            contentSubjects.refreshData(data.lsSubjects);
        }
    });

});