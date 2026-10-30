const API_URL = "/students";
const avatarColors = [
  ["#edf3e6", "#65804c"],
  ["#f1eafa", "#8069aa"],
  ["#fff0e5", "#b47e5e"],
  ["#e6f1f5", "#5a8492"],
  ["#f9e9ee", "#a46d7d"],
];
const elements = {
  rows: document.querySelector("#student-rows"),
  search: document.querySelector("#student-search"),
  courseFilter: document.querySelector("#course-filter"),
  courseList: document.querySelector("#course-list"),
  emptyState: document.querySelector("#empty-state"),
  emptyTitle: document.querySelector("#empty-title"),
  emptyCopy: document.querySelector("#empty-copy"),
  tableSummary: document.querySelector("#table-summary"),
  directoryCount: document.querySelector("#directory-count"),
  navCount: document.querySelector("#nav-count"),
  statStudents: document.querySelector("#stat-students"),
  statCourses: document.querySelector("#stat-courses"),
  statAge: document.querySelector("#stat-age"),
  modal: document.querySelector("#student-modal"),
  form: document.querySelector("#student-form"),
  formError: document.querySelector("#form-error"),
  submitButton: document.querySelector("#submit-student"),
  detailModal: document.querySelector("#detail-modal"),
  toast: document.querySelector("#toast"),
};

let students = [];
let toastTimeout;

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function showToast(message, isError = false) {
  clearTimeout(toastTimeout);
  elements.toast.textContent = message;
  elements.toast.classList.toggle("error", isError);
  elements.toast.classList.add("visible");
  toastTimeout = setTimeout(() => elements.toast.classList.remove("visible"), 3200);
}

async function requestStudents(path = "", options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.detail) message = Array.isArray(body.detail)
        ? body.detail.map((issue) => issue.msg).join(", ")
        : body.detail;
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
    }
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}

function filteredStudents() {
  const query = elements.search.value.trim().toLowerCase();
  const course = elements.courseFilter.value;
  return students.filter((student) => {
    const matchesQuery = !query
      || student.name.toLowerCase().includes(query)
      || student.course.toLowerCase().includes(query)
      || String(student.id).includes(query);
    return matchesQuery && (!course || student.course === course);
  }).sort((left, right) => right.id - left.id);
}

function renderStudents() {
  const visibleStudents = filteredStudents();
  elements.directoryCount.textContent = String(visibleStudents.length);
  elements.tableSummary.textContent = `Showing ${visibleStudents.length} of ${students.length} student${students.length === 1 ? "" : "s"}`;
  elements.emptyState.hidden = visibleStudents.length > 0;
  elements.rows.hidden = visibleStudents.length === 0;
  elements.emptyTitle.textContent = students.length === 0 ? "Your community starts here." : "No students found.";
  elements.emptyCopy.textContent = students.length === 0
    ? "Add your first student to bring this space to life."
    : "Try another name or course, or clear your filters.";
  document.querySelector("#empty-add").hidden = students.length > 0;
  elements.rows.innerHTML = visibleStudents.map((student, index) => {
    const [background, foreground] = avatarColors[index % avatarColors.length];
    const safeName = escapeHtml(student.name);
    const safeCourse = escapeHtml(student.course);
    return `<tr>
      <td><div class="student-cell"><span class="student-avatar" style="background:${background};color:${foreground}">${escapeHtml(initials(student.name))}</span><span><span class="student-name">${safeName}</span><span class="student-subtitle">Campus community</span></span></div></td>
      <td><span class="course-pill" title="${safeCourse}">${safeCourse}</span></td>
      <td>${student.age}</td>
      <td><span class="student-id">#${student.id}</span></td>
      <td><div class="row-actions">
        <button class="icon-button" type="button" data-action="view" data-id="${student.id}" aria-label="View ${safeName}" title="View student"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2.5 10s2.7-5 7.5-5 7.5 5 7.5 5-2.7 5-7.5 5-7.5-5-7.5-5Z"/><circle cx="10" cy="10" r="2"/></svg></button>
        <button class="icon-button delete" type="button" data-action="delete" data-id="${student.id}" aria-label="Delete ${safeName}" title="Delete student"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M8 6V4h4v2m2 0-.7 10H6.7L6 6m2.5 3v4m3-4v4"/></svg></button>
      </div></td>
    </tr>`;
  }).join("");
}

function renderInsights() {
  const courseCounts = new Map();
  for (const student of students) {
    courseCounts.set(student.course, (courseCounts.get(student.course) || 0) + 1);
  }
  const courses = [...courseCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const totalCourses = courses.length;
  const totalStudents = students.length;
  elements.statStudents.textContent = String(totalStudents).padStart(2, "0");
  elements.statCourses.textContent = String(totalCourses).padStart(2, "0");
  elements.statAge.textContent = totalStudents
    ? String(Math.round(students.reduce((sum, student) => sum + student.age, 0) / totalStudents))
    : "—";
  elements.navCount.textContent = String(totalStudents);
  elements.courseFilter.innerHTML = `<option value="">All courses</option>${courses.map(([course]) => `<option value="${escapeHtml(course)}">${escapeHtml(course)}</option>`).join("")}`;
  elements.courseList.innerHTML = courses.length
    ? courses.slice(0, 5).map(([course, count]) => {
      const percentage = Math.round((count / totalStudents) * 100);
      return `<div class="course-item"><div class="course-item-top"><span class="course-item-name" title="${escapeHtml(course)}">${escapeHtml(course)}</span><span class="course-item-count">${count} ${count === 1 ? "student" : "students"}</span></div><div class="course-track"><div class="course-fill" style="width:${percentage}%"></div></div></div>`;
    }).join("")
    : '<div class="course-empty">Your course mix will appear here.</div>';
  elements.courseFilter.value = "";
  document.querySelector("#insight-footer-copy").textContent = totalCourses
    ? `${totalCourses} ${totalCourses === 1 ? "course" : "courses"} represented, and growing.`
    : "Every path adds something unique.";
}

async function refreshStudents() {
  try {
    students = await requestStudents();
    renderInsights();
    renderStudents();
  } catch (error) {
    showToast(`Could not load students: ${error.message}`, true);
    elements.emptyTitle.textContent = "We couldn't reach your directory.";
    elements.emptyCopy.textContent = "Check that the API is running, then refresh the page.";
    elements.emptyState.hidden = false;
  }
}

function openAddDialog() {
  elements.form.reset();
  elements.formError.hidden = true;
  elements.formError.textContent = "";
  elements.modal.showModal();
  elements.form.elements.name.focus();
}

async function openStudentDetails(id) {
  try {
    const student = await requestStudents(`/${id}`);
    document.querySelector("#detail-title").textContent = student.name;
    document.querySelector("#detail-avatar").textContent = initials(student.name);
    document.querySelector("#detail-id").textContent = `#${student.id}`;
    document.querySelector("#detail-course").textContent = student.course;
    document.querySelector("#detail-age").textContent = `${student.age} years`;
    elements.detailModal.showModal();
  } catch (error) {
    showToast(`Could not load student: ${error.message}`, true);
  }
}

document.querySelector("#open-add").addEventListener("click", openAddDialog);
document.querySelector("#empty-add").addEventListener("click", openAddDialog);
document.querySelector("#close-add").addEventListener("click", () => elements.modal.close());
document.querySelector("#cancel-add").addEventListener("click", () => elements.modal.close());
document.querySelector("#close-detail").addEventListener("click", () => elements.detailModal.close());
document.querySelector("#close-detail-action").addEventListener("click", () => elements.detailModal.close());
elements.search.addEventListener("input", renderStudents);
elements.courseFilter.addEventListener("change", renderStudents);

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  elements.formError.hidden = true;
  elements.submitButton.disabled = true;
  elements.submitButton.textContent = "Adding...";
  const formData = new FormData(elements.form);
  const student = {
    name: String(formData.get("name")).trim(),
    age: Number(formData.get("age")),
    course: String(formData.get("course")).trim(),
  };
  try {
    await requestStudents("", { method: "POST", body: JSON.stringify(student) });
    elements.modal.close();
    await refreshStudents();
    showToast(`${student.name} was added to your community.`);
  } catch (error) {
    elements.formError.textContent = error.message;
    elements.formError.hidden = false;
  } finally {
    elements.submitButton.disabled = false;
    elements.submitButton.innerHTML = 'Add student <span aria-hidden="true">↗</span>';
  }
});

elements.rows.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  if (button.dataset.action === "view") {
    await openStudentDetails(id);
    return;
  }
  const student = students.find((item) => item.id === id);
  if (!student || !window.confirm(`Remove ${student.name} from your student directory?`)) return;
  try {
    await requestStudents(`/${id}`, { method: "DELETE" });
    await refreshStudents();
    showToast(`${student.name} was removed from your directory.`);
  } catch (error) {
    showToast(`Could not delete student: ${error.message}`, true);
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    elements.search.focus();
  }
});

function updateActiveNavigation() {
  const activeSection = window.location.hash || "#overview";
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.hash === activeSection);
  });
}

window.addEventListener("hashchange", updateActiveNavigation);
updateActiveNavigation();

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
}).format(new Date());

function startCommunityArt() {
  const canvas = document.querySelector("#community-art");
  const context = canvas.getContext("2d");
  const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointer = { x: null, y: null };
  let width = 0;
  let height = 0;
  let frame = 0;
  let points = [];

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const amount = Math.max(20, Math.min(42, Math.round(width / 14)));
    points = Array.from({ length: amount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      radius: Math.random() * 1.7 + 0.5,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    const time = frame * 0.012;
    points.forEach((point, index) => {
      if (!motionReduced) {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;
      }
      const pulse = motionReduced ? 0 : Math.sin(time + point.phase) * 0.5;
      const x = point.x + pulse;
      const y = point.y;
      if (pointer.x !== null) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        if (Math.hypot(dx, dy) < 105) {
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(pointer.x, pointer.y);
          context.strokeStyle = "rgba(224, 242, 196, 0.28)";
          context.lineWidth = 0.7;
          context.stroke();
        }
      }
      for (let next = index + 1; next < points.length; next += 1) {
        const other = points[next];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);
        if (distance < 84) {
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = `rgba(218, 237, 191, ${0.12 * (1 - distance / 84)})`;
          context.lineWidth = 0.65;
          context.stroke();
        }
      }
      context.beginPath();
      context.arc(x, y, point.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(230, 243, 207, ${0.35 + (point.radius / 1.7) * 0.4})`;
      context.fill();
    });
    frame += 1;
    if (!motionReduced) window.requestAnimationFrame(draw);
  }

  canvas.addEventListener("pointermove", (event) => {
    const bounds = canvas.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
  });
  canvas.addEventListener("pointerleave", () => {
    pointer.x = null;
    pointer.y = null;
  });
  new ResizeObserver(resize).observe(canvas);
  resize();
  draw();
}

startCommunityArt();
refreshStudents();
