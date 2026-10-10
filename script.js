const DATE_TODAY = "2026-10-10";
    let tasks = [];
    let activeFilter = "all";
    let searchTerm = "";
    let editingTask = null;
    const priorityRank = { High: 0, Medium: 1, Low: 2 };

    const byId = (id) => document.getElementById(id);
    const dateFormatter = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" });

    function formatDue(dateString) {
      if (!dateString) return "No due date";
      const date = new Date(dateString + "T12:00:00");
      if (dateString === DATE_TODAY) return "Due today";
      const tomorrow = new Date(DATE_TODAY + "T12:00:00"); tomorrow.setDate(tomorrow.getDate() + 1);
      if (dateString === tomorrow.toISOString().slice(0, 10)) return "Due tomorrow";
      return "Due " + dateFormatter.format(date);
    }

    function getSortedTasks(records = tasks) {
      return [...records].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const dueA = a.due_date || "9999-12-31", dueB = b.due_date || "9999-12-31";
        if (dueA !== dueB) return dueA.localeCompare(dueB);
        if (priorityRank[a.priority] !== priorityRank[b.priority]) return priorityRank[a.priority] - priorityRank[b.priority];
        return (a.created_at || "").localeCompare(b.created_at || "");
      });
    }

    function getRecommendedTask() {
      return getSortedTasks(tasks.filter(task => !task.completed))[0] || null;
    }

    function matchesFilter(task) {
      if (activeFilter === "today") return !task.completed && task.due_date === DATE_TODAY;
      if (activeFilter === "upcoming") return !task.completed && (!task.due_date || task.due_date > DATE_TODAY);
      if (activeFilter === "completed") return task.completed;
      return true;
    }

    function renderSummary() {
      const completed = tasks.filter(t => t.completed).length;
      const remaining = tasks.length - completed;
      const focus = getRecommendedTask();
      byId("completed-count").textContent = completed;
      byId("remaining-count").textContent = remaining;
      byId("focus-summary").textContent = focus ? focus.title : "Your list is clear";
      byId("focus-task-title").textContent = focus ? focus.title : "Nothing urgent right now";
      byId("focus-task-meta").textContent = focus ? `${focus.priority} priority · ${formatDue(focus.due_date)}` : "Enjoy the space — add a task when you’re ready.";
      byId("start-focus-button").disabled = !focus;
    }

    function createTaskElement(task) {
      const fragment = byId("task-template").content.cloneNode(true);
      const el = fragment.querySelector("article");
      el.dataset.taskId = task.__backendId;
      const checkbox = el.querySelector(".check-control");
      checkbox.checked = task.completed;
      checkbox.setAttribute("aria-label", task.completed ? "Mark task incomplete" : "Mark task complete");
      el.querySelector(".task-title").textContent = task.title;
      const notes = el.querySelector(".task-notes");
      if (task.notes) { notes.textContent = task.notes; notes.classList.remove("hidden"); }
      const priority = el.querySelector(".priority-tag");
      priority.textContent = task.priority;
      priority.classList.add("priority-" + task.priority.toLowerCase());
      const category = el.querySelector(".category-tag");
      if (task.category) { category.textContent = task.category; category.classList.remove("hidden"); }
      el.querySelector(".due-tag span").textContent = formatDue(task.due_date);
      if (task.completed) el.classList.add("opacity-70");
      checkbox.addEventListener("change", () => toggleComplete(task, checkbox));
      el.querySelector(".edit-button").addEventListener("click", () => openEdit(task));
      el.querySelector(".delete-button").addEventListener("click", () => el.querySelector(".delete-confirmation").classList.remove("hidden"));
      el.querySelector(".cancel-delete").addEventListener("click", () => el.querySelector(".delete-confirmation").classList.add("hidden"));
      el.querySelector(".confirm-delete").addEventListener("click", () => deleteTask(task, el));
      return el;
    }

    function renderTasks() {
      const list = byId("task-list");
      const filtered = getSortedTasks(tasks.filter(task => {
        const needle = searchTerm.toLowerCase();
        return matchesFilter(task) && (!needle || [task.title, task.notes, task.category].join(" ").toLowerCase().includes(needle));
      }));
      const current = new Map([...list.children].map(el => [el.dataset.taskId, el]));
      filtered.forEach(task => {
        const existing = current.get(task.__backendId);
        if (existing) {
          const replacement = createTaskElement(task);
          existing.replaceWith(replacement);
          current.delete(task.__backendId);
        } else list.appendChild(createTaskElement(task));
      });
      current.forEach(el => el.remove());
      byId("empty-state").classList.toggle("hidden", filtered.length !== 0);
      renderPlan();
      if (window.lucide) lucide.createIcons();
    }

    function renderPlan() {
      const plan = byId("plan-list");
      plan.innerHTML = "";
      getSortedTasks(tasks.filter(t => !t.completed)).slice(0, 3).forEach((task, index) => {
        const item = byId("plan-template").content.cloneNode(true);
        item.querySelector(".plan-number").textContent = index + 1;
        item.querySelector(".plan-title").textContent = task.title;
        plan.appendChild(item);
      });
    }

    function renderAll() { renderSummary(); renderTasks(); }

    async function createTask(event) {
      event.preventDefault();
      const title = byId("task-title").value.trim();
      const error = byId("task-error");
      if (!title) { error.textContent = "Add a task title to keep your plan clear."; byId("task-title").focus(); return; }
      if (tasks.length >= 999) { error.textContent = "Your task list has reached its 999-task limit. Delete a task before adding another."; return; }
      const button = document.querySelector("[data-template-id='add-task-button']");
      button.disabled = true; error.textContent = "";
      const result = await window.dataSdk.create({
        title, notes: byId("task-notes").value.trim(), due_date: byId("task-due").value,
        priority: byId("task-priority").value, category: byId("task-category").value.trim(),
        completed: false, created_at: new Date().toISOString()
      });
      button.disabled = false;
      if (result.isOk) {
        event.target.reset(); byId("task-priority").value = "Medium";
      } else error.textContent = "Your task could not be saved. Please try again.";
    }

    async function toggleComplete(task, checkbox) {
      checkbox.disabled = true;
      const result = await window.dataSdk.update({ ...task, completed: checkbox.checked });
      checkbox.disabled = false;
      if (!result.isOk) { checkbox.checked = task.completed; byId("task-error").textContent = "Task status could not be updated. Please try again."; }
    }

    function openEdit(task) {
      editingTask = task;
      byId("edit-title").value = task.title;
      byId("edit-notes").value = task.notes || "";
      byId("edit-due").value = task.due_date || "";
      byId("edit-priority").value = task.priority;
      byId("edit-category").value = task.category || "";
      byId("edit-error").textContent = "";
      byId("edit-overlay").classList.remove("hidden"); byId("edit-overlay").classList.add("flex");
      byId("edit-title").focus();
    }
    function closeEdit() {
      editingTask = null; byId("edit-overlay").classList.add("hidden"); byId("edit-overlay").classList.remove("flex");
    }
    async function saveEdit(event) {
      event.preventDefault();
      const title = byId("edit-title").value.trim();
      if (!title) { byId("edit-error").textContent = "A task title is required."; return; }
      const button = byId("save-edit"); button.disabled = true;
      const result = await window.dataSdk.update({ ...editingTask, title, notes: byId("edit-notes").value.trim(), due_date: byId("edit-due").value, priority: byId("edit-priority").value, category: byId("edit-category").value.trim() });
      button.disabled = false;
      if (result.isOk) closeEdit(); else byId("edit-error").textContent = "Changes could not be saved. Please try again.";
    }
    async function deleteTask(task, el) {
      const button = el.querySelector(".confirm-delete"); button.disabled = true;
      const result = await window.dataSdk.delete(task);
      if (!result.isOk) { button.disabled = false; byId("task-error").textContent = "Task could not be deleted. Please try again."; }
    }

    function startFocus() {
      const focus = getRecommendedTask();
      if (!focus) return;
      const card = document.querySelector(`[data-task-id="${focus.__backendId}"]`);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("is-focus");
        setTimeout(() => card.classList.remove("is-focus"), 2400);
      }
      const message = byId("focus-message");
      message.textContent = "Focus mode started: give this one task your full attention.";
      message.classList.remove("hidden");
    }

    const handler = {
      onDataChanged(data) {
        tasks = data;
        renderAll();
      }
    };

    document.addEventListener("DOMContentLoaded", async () => {
      byId("today-date").textContent = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date(DATE_TODAY + "T12:00:00"));
      byId("add-task-form").addEventListener("submit", createTask);
      byId("edit-task-form").addEventListener("submit", saveEdit);
      byId("close-edit").addEventListener("click", closeEdit);
      byId("cancel-edit").addEventListener("click", closeEdit);
      byId("start-focus-button").addEventListener("click", startFocus);
      byId("task-search").addEventListener("input", event => { searchTerm = event.target.value; renderTasks(); });
      document.querySelectorAll(".filter-button").forEach(button => button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        document.querySelectorAll(".filter-button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
        renderTasks();
      }));
      if (window.lucide) lucide.createIcons();
      const result = await window.dataSdk.init(handler);
      if (!result.isOk) byId("task-error").textContent = "Your task list could not be loaded. Please refresh and try again.";
    });
