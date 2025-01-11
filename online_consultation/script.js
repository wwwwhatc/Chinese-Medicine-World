document.addEventListener('DOMContentLoaded', function() {
    const addSymptomButton = document.getElementById('addSymptom');
    const symptomInput = document.getElementById('symptomInput');
    const symptomTags = document.getElementById('symptomTags');
    const submitSymptomButton = document.getElementById('submitSymptom');
    const clearSymptomsButton = document.getElementById('clearSymptoms');
    const loading = document.getElementById('loading');
    const medicineMapSection = document.querySelector('.medicine-map');
    const medicineList = document.getElementById('medicineList');
    const historyList = document.getElementById('historyList');
    const historySection = document.getElementById('history');

    const medicineModal = document.getElementById('medicineModal');
    const closeModalButton = document.querySelector('.close-button');
    const modalMedicineName = document.getElementById('modalMedicineName');
    const modalEfficacy = document.getElementById('modalEfficacy');
    const modalUsage = document.getElementById('modalUsage');
    const modalSideEffects = document.getElementById('modalSideEffects');

    let symptoms = [];
    let historyRecords = [];

    // 药品详细信息数据
    const medicineDetails = {
        '川芎茶': {
            efficacy: '活血行气，祛风止痛。',
            usage: '每日一剂，煎服。',
            sideEffects: '少数人可能出现胃部不适。'
        },
        '天麻丸': {
            efficacy: '平肝息风，止头痛。',
            usage: '每次2丸，一日3次。',
            sideEffects: '长期服用可能导致消化不良。'
        },
        '板蓝根冲剂': {
            efficacy: '清热解毒，抗病毒。',
            usage: '溶解一包于温水中，每日3次。',
            sideEffects: '可能引起胃肠不适。'
        },
        '感冒灵颗粒': {
            efficacy: '缓解感冒症状，退热镇痛。',
            usage: '每次10克，温水冲服，一日3次。',
            sideEffects: '少数人可能出现恶心。'
        },
        '蜜炼川贝枇杷膏': {
            efficacy: '润肺止咳，化痰平喘。',
            usage: '每次15毫升，一日3次。',
            sideEffects: '可能引起轻微胃部不适。'
        },
        '强力枇杷露': {
            efficacy: '清肺润燥，止咳化痰。',
            usage: '每次10毫升，一日3次。',
            sideEffects: '可能导致喉咙轻微刺激。'
        },
        '酸枣仁汤': {
            efficacy: '养心安神，助眠。',
            usage: '每日一剂，煎服。',
            sideEffects: '少数人可能出现轻微头晕。'
        },
        '天王补心丹': {
            efficacy: '补心益脾，安神定志。',
            usage: '每日一丸，温水送服。',
            sideEffects: '可能引起胃部不适。'
        },
        '香砂六君子汤': {
            efficacy: '健脾和胃，消食导滞。',
            usage: '每日一剂，煎服。',
            sideEffects: '少数人可能出现腹泻。'
        },
        '四磨汤': {
            efficacy: '化痰止咳，健脾开胃。',
            usage: '每日一剂，煎服。',
            sideEffects: '可能引起轻微胃部不适。'
        }
    };

    // 扩展症状映射，包括同义词和不同表达方式
    const symptomMap = {
        '头痛': ['头痛', '剧烈头痛', '轻度头痛', '头部疼痛'],
        '发烧': ['发烧', '高烧', '体温升高'],
        '咳嗽': ['咳嗽', '干咳', '咳嗽有痰'],
        '失眠': ['失眠', '难以入睡', '睡眠不足'],
        '胃痛': ['胃痛', '胃部不适', '胃部疼痛']
    };

    // 重新定义症状到药品的映射
    const symptomToMedicinesMap = {
        '头痛': ['川芎茶', '天麻丸'],
        '发烧': ['板蓝根冲剂', '感冒灵颗粒'],
        '咳嗽': ['蜜炼川贝枇杷膏', '强力枇杷露'],
        '失眠': ['酸枣仁汤', '天王补心丹'],
        '胃痛': ['香砂六君子汤', '四磨汤']
    };

    // 准备Fuse.js的数据集
    const symptomList = [];
    for (let key in symptomMap) {
        symptomMap[key].forEach(variation => {
            symptomList.push({ symptom: variation, key: key });
        });
    }

    const fuseOptions = {
        includeScore: true,
        threshold: 0.4, // 调整阈值以控制匹配严格度
        keys: ['symptom']
    };

    const fuse = new Fuse(symptomList, fuseOptions);

    // 添加症状标签
    addSymptomButton.addEventListener('click', function() {
        const symptom = symptomInput.value.trim();
        if (symptom && !symptoms.includes(symptom)) {
            symptoms.push(symptom);
            renderSymptomTags();
            symptomInput.value = '';
            console.log(`添加症状: ${symptom}`);
        }
    });

    // 按下Enter键添加症状
    symptomInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSymptomButton.click();
        }
    });

    // 渲染症状标签
    function renderSymptomTags() {
        symptomTags.innerHTML = '';
        symptoms.forEach((symptom, index) => {
            const tag = document.createElement('div');
            tag.classList.add('symptom-tag');
            tag.innerHTML = `${symptom} <span class="remove-tag" data-index="${index}">&times;</span>`;
            symptomTags.appendChild(tag);
        });
        console.log(`当前症状列表: ${symptoms}`);
    }

    // 移除症状标签
    symptomTags.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-tag')) {
            const index = e.target.getAttribute('data-index');
            const removedSymptom = symptoms.splice(index, 1);
            renderSymptomTags();
            console.log(`移除症状: ${removedSymptom}`);
        }
    });

    // 清除所有症状
    clearSymptomsButton.addEventListener('click', function() {
        symptoms = [];
        renderSymptomTags();
        console.log('清除所有症状');
    });

    // 提交问诊
    submitSymptomButton.addEventListener('click', function() {
        if (symptoms.length === 0) {
            alert('请输入至少一个症状描述，记住输入完症状一定要点击右边的添加。');
            console.log('提交时症状列表为空');
            return;
        }

        // 显示加载动画
        loading.style.display = 'flex';
        medicineMapSection.style.display = 'none';

        console.log(`提交问诊，症状: ${symptoms}`);

        // 模拟异步请求
        setTimeout(function() {
            const medicineRecommendations = getMedicineRecommendations(symptoms);
            displayMedicineRecommendations(medicineRecommendations);
            loading.style.display = 'none';

            // 保存到历史记录
            const timestamp = new Date().toLocaleString();
            const newRecord = {
                timestamp: timestamp,
                symptoms: [...symptoms],
                recommendations: medicineRecommendations ? [...medicineRecommendations] : []
            };
            historyRecords.unshift(newRecord);

            // 更新localStorage
            localStorage.setItem('historyRecords', JSON.stringify(historyRecords));

            renderHistory();
            console.log('问诊记录已保存');
        }, 1500);
    });

    // 获取药品推荐
    function getMedicineRecommendations(symptoms) {
        let matchedMedicines = new Set();

        symptoms.forEach(userSymptom => {
            // 预处理用户输入：去除空格
            const processedSymptom = userSymptom.replace(/\s+/g, '');
            console.log(`处理后的症状: ${processedSymptom}`);

            // 使用Fuse.js进行模糊匹配
            const results = fuse.search(processedSymptom);
            console.log(`Fuse.js匹配结果: ${JSON.stringify(results)}`);

            if (results.length > 0) {
                results.forEach(result => {
                    const mainSymptom = result.item.key;
                    const medicines = symptomToMedicinesMap[mainSymptom];
                    if (medicines) {
                        medicines.forEach(medicine => matchedMedicines.add(medicine));
                        console.log(`匹配到症状: ${mainSymptom}, 推荐药品: ${medicines}`);
                    }
                });
            }
        });

        return matchedMedicines.size > 0 ? Array.from(matchedMedicines) : null;
    }

    // 展示药品推荐
    function displayMedicineRecommendations(medicines) {
        medicineList.innerHTML = '';
        if (medicines) {
            medicines.forEach(medicine => {
                const medicineDiv = document.createElement('div');
                medicineDiv.classList.add('medicine-item');
                medicineDiv.textContent = medicine;
                medicineDiv.setAttribute('data-medicine', medicine);
                medicineList.appendChild(medicineDiv);
            });
            console.log(`推荐药品: ${medicines}`);
        } else {
            medicineList.innerHTML = '<p>很抱歉，我们无法根据您的描述提供推荐。</p>';
            console.log('未找到推荐药品');
        }
        medicineMapSection.style.display = 'block';
    }

    // 显示历史记录
    function renderHistory() {
        historyList.innerHTML = '';
        if (historyRecords.length === 0) {
            historyList.innerHTML = '<p>暂无历史记录。</p>';
            return;
        }

        historyRecords.forEach(record => {
            const recordDiv = document.createElement('div');
            recordDiv.classList.add('history-item');
            recordDiv.innerHTML = `
                <p><strong>时间：</strong>${record.timestamp}</p>
                <p><strong>症状：</strong>${record.symptoms.join('，')}</p>
                <p><strong>推荐药品：</strong>${record.recommendations.length > 0 ? record.recommendations.join('，') : '无'}</p>
            `;
            historyList.appendChild(recordDiv);
        });
        console.log('渲染历史记录');
    }

    // 处理药品点击事件，显示详情
    medicineList.addEventListener('click', function(e) {
        if (e.target.classList.contains('medicine-item')) {
            const medicineName = e.target.getAttribute('data-medicine');
            showMedicineDetails(medicineName);
        }
    });

    // 显示药品详情
    function showMedicineDetails(medicineName) {
        const details = medicineDetails[medicineName];
        if (details) {
            modalMedicineName.textContent = medicineName;
            modalEfficacy.textContent = details.efficacy;
            modalUsage.textContent = details.usage;
            modalSideEffects.textContent = details.sideEffects;
            medicineModal.style.display = 'block';
            console.log(`显示药品详情: ${medicineName}`);
        } else {
            alert('没有找到该药品的详细信息。');
            console.log(`未找到药品详情: ${medicineName}`);
        }
    }

    // 关闭模态框
    closeModalButton.addEventListener('click', function() {
        medicineModal.style.display = 'none';
        console.log('关闭模态框');
    });

    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target == medicineModal) {
            medicineModal.style.display = 'none';
            console.log('点击模态框外部，关闭模态框');
        }
    });

    // 初始化历史记录，从localStorage中加载
    if (localStorage.getItem('historyRecords')) {
        historyRecords = JSON.parse(localStorage.getItem('historyRecords'));
        renderHistory();
        console.log('加载历史记录');
    }

    // 清除历史记录功能（可选）
    const clearHistoryButton = document.createElement('button');
    clearHistoryButton.textContent = '清除历史记录';
    clearHistoryButton.classList.add('clear-history-button');
    clearHistoryButton.addEventListener('click', function() {
        if (confirm('确定要清除所有历史记录吗？')) {
            historyRecords = [];
            localStorage.removeItem('historyRecords');
            renderHistory();
            console.log('清除所有历史记录');
        }
    });
    historyList.parentElement.appendChild(clearHistoryButton);
});
