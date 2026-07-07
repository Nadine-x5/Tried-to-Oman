document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // ١. التبديل تفاعلياً بين التبويبات اليومية (Tabs)
    // ==========================================
    const tabs = document.querySelectorAll('.day-tab');
    const contents = document.querySelectorAll('.day-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // إزالة الصنف النشط من كافة الأزرار
            tabs.forEach(t => t.classList.remove('active'));
            // إخفاء كافة المحتويات للأيام
            contents.forEach(c => c.classList.remove('active'));

            // تنشيط التبويب المختار وعرض محتواه المتوافق
            tab.classList.add('active');
            const dayId = tab.getAttribute('data-day');
            const activeContent = document.getElementById(dayId);
            if (activeContent) {
                activeContent.classList.add('active');
                // تمرير خفيف إلى أعلى خط سير اليوم لراحة القارئ
                activeContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });

    // ==========================================
    // ٢. حاسبة الميزانية التفاعلية (Budget Calculator)
    // ==========================================
    const rentInput = document.getElementById('car-rent');
    const hotelInput = document.getElementById('hotel-cost');
    const diningInput = document.getElementById('dining-cost');
    const actInput = document.getElementById('activities-cost');
    const shopInput = document.getElementById('souvenirs-cost');

    const totalVal = document.getElementById('total-val');
    const carVal = document.getElementById('car-val');
    const hotelVal = document.getElementById('hotel-val');
    const foodVal = document.getElementById('food-val');
    const actVal = document.getElementById('act-val');
    const shopVal = document.getElementById('shop-val');

    function calculateBudget() {
        const travelersCount = 8; // ٧ كبار + ١ طفل
        const daysCount = 4;
        const nightsCount = 3;

        // قراءة وحساب القيم المدخلة
        const carRentTotal = parseFloat(rentInput.value) || 0;
        const hotelTotal = (parseFloat(hotelInput.value) || 0) * nightsCount;
        const diningTotal = (parseFloat(diningInput.value) || 0) * travelersCount * daysCount;
        const actTotal = parseFloat(actInput.value) || 0;
        const shopTotal = parseFloat(shopInput.value) || 0;

        // المجموع الكلي
        const total = carRentTotal + hotelTotal + diningTotal + actTotal + shopTotal;

        // تحديث الواجهة والملخص
        totalVal.textContent = Math.round(total).toLocaleString('ar-EG');
        carVal.textContent = Math.round(carRentTotal).toLocaleString('ar-EG');
        hotelVal.textContent = Math.round(hotelTotal).toLocaleString('ar-EG');
        foodVal.textContent = Math.round(diningTotal).toLocaleString('ar-EG');
        actVal.textContent = Math.round(actTotal).toLocaleString('ar-EG');
        shopVal.textContent = Math.round(shopTotal).toLocaleString('ar-EG');

        // تغيير تنبيه الميزانية ديناميكياً إذا زادت التكلفة الإجمالية عن حد معين
        const statusAlert = document.querySelector('.budget-status-alert');
        if (total > 1000) {
            statusAlert.className = 'budget-status-alert danger';
            statusAlert.style.backgroundColor = 'var(--color-danger)';
            statusAlert.style.color = 'var(--color-light)';
            statusAlert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> <span>تنبيه: التكلفة الإجمالية مرتفعة نسبياً للخيارات الترفيهية الفخمة.</span>';
        } else {
            statusAlert.className = 'budget-status-alert positive';
            statusAlert.style.backgroundColor = 'var(--color-primary-pale)';
            statusAlert.style.color = 'var(--color-primary-dark)';
            statusAlert.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>الميزانية محسوبة لثاني وثالث درجة من الخيارات السياحية الفخمة والمريحة لعائلتكم.</span>';
        }
    }

    // ربط الحساب اللحظي مع عمليات الإدخال
    const budgetInputs = [rentInput, hotelInput, diningInput, actInput, shopInput];
    budgetInputs.forEach(input => {
        if(input) {
            input.addEventListener('input', calculateBudget);
        }
    });

    // التنفيذ للوهلة الأولى عند التحميل
    calculateBudget();

    // ==========================================
    // ٣. قائمة التعبئة التفاعلية (Interactive Checklist)
    // ==========================================
    const checkboxes = document.querySelectorAll('.chk-item');
    const progressBar = document.getElementById('checklist-progress');
    const progressPercent = document.getElementById('progress-percent');

    function updateChecklistProgress() {
        const totalItems = checkboxes.length;
        if (totalItems === 0) return;
        
        let checkedCount = 0;
        const savedStates = [];

        checkboxes.forEach((cb, index) => {
            savedStates.push(cb.checked);
            if (cb.checked) {
                checkedCount++;
            }
        });

        // حساب النسبة المئوية وتحديث البصريات
        const percentage = Math.round((checkedCount / totalItems) * 100);
        progressBar.style.width = percentage + '%';
        progressPercent.textContent = percentage + '%';

        // الحفظ المحلي
        localStorage.setItem('salalahChecklistState', JSON.stringify(savedStates));
    }

    function loadChecklistState() {
        const savedData = localStorage.getItem('salalahChecklistState');
        if (savedData) {
            try {
                const states = JSON.parse(savedData);
                checkboxes.forEach((cb, index) => {
                    if (states[index] !== undefined) {
                        cb.checked = states[index];
                    }
                });
            } catch (e) {
                console.error("خطأ في قراءة بيانات قائمة التحقق المحلي", e);
            }
        }
        updateChecklistProgress();
    }

    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateChecklistProgress);
    });

    loadChecklistState();

    // ==========================================
    // ٤. الملاحظات التفاعلية وحفظها تلقائياً (Notes Auto-save)
    // ==========================================
    const notesArea = document.getElementById('trip-notes');
    const saveStatus = document.getElementById('notes-save-status');
    let saveTimeout = null;

    // تحميل الملاحظات المسبقة
    if (notesArea) {
        notesArea.value = localStorage.getItem('salalahTripNotes') || '';
    }

    if (notesArea) {
        notesArea.addEventListener('input', () => {
            saveStatus.style.display = 'inline-flex';
            saveStatus.querySelector('span').textContent = 'جاري الحفظ الإلكتروني...';
            saveStatus.querySelector('i').className = 'fa-solid fa-spinner fa-spin';

            // تصفية المهمل وتأخير الحفظ لتقليل الأعباء (Debouncing)
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                localStorage.setItem('salalahTripNotes', notesArea.value);
                saveStatus.querySelector('span').textContent = 'تم الحفظ تلقائياً في جهازك الإلكتروني.';
                saveStatus.querySelector('i').className = 'fa-regular fa-floppy-disk';
            }, 800);
        });
    }

    // ==========================================
    // ٥. نافذة مكبر الصور (Image Lightbox Modal)
    // ==========================================
    const modal = document.getElementById('image-modal-viewer');
    const modalImg = document.getElementById('modal-img-target');
    const captionText = document.getElementById('modal-caption-text');
    const closeBtn = document.getElementById('modal-close');
    
    // العثور على كافة الصور القابلة للتكبير في معرض الصور والجدول الزمني
    const imagesToExpand = document.querySelectorAll('.timeline-img-wrapper img, .gallery-item-card img');

    imagesToExpand.forEach(image => {
        image.addEventListener('click', () => {
            if (modal && modalImg && captionText) {
                modal.style.display = 'block';
                modalImg.src = image.src;
                captionText.textContent = image.alt || 'معلم سياحي صلالة';
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // إغلاق النافذة التكبيرية عند النقر خارج الصورة
    if (modal) {
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // ==========================================
    // ٦. الربط البرمجي لخرائط جوجل (Google Maps Launch)
    // ==========================================
    const mapPlaceholders = document.querySelectorAll('.map-placeholder');
    mapPlaceholders.forEach(placeholder => {
        placeholder.addEventListener('click', () => {
            const coords = placeholder.getAttribute('data-geo');
            if (coords) {
                const mapUrl = `https://www.google.com/maps/search/?api=1&query=${coords}`;
                window.open(mapUrl, '_blank');
            }
        });
    });

    // ==========================================
    // ٧. تفعيل حركات الظهور عند التمرير (Intersection Observer)
    // ==========================================
    const animScrollElements = document.querySelectorAll('.animate-on-scroll');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('appear');
                    // إيقاف التتبع بمجرد الظهور الأول
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animScrollElements.forEach(el => observer.observe(el));
    } else {
        // حماية للمتصفحات القديمة التي لا تدعم المراقبة
        animScrollElements.forEach(el => el.classList.add('appear'));
    }
});
