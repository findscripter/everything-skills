---
name: health-goal-analyzer
title: 健康目标分析器技能
description: 分析健康目标数据、识别目标模式、评估目标进度,并提供个性化目标管理建议。支持与营养、运动、睡眠等健康数据的关联分析。
domain: 领域/medical
triggers: [health goal, habit streak]
tags: [health, medical, goal-tracking, smart-goal, habit, motivation, data-analysis, echarts, visualization]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [fact-checking, csv-data-cleaner]
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Health Goal Analyzer Skill

Analyze health goal data, identify goal patterns and progress, assess goal attainment, and provide personalized goal management recommendations.

## When to Use
- You need to assess whether a health goal follows the SMART principles and identify weak points in how the goal was set.
- You want to track goal progress and run correlation analysis against other health data such as nutrition, exercise, and sleep.
- You need goal optimization recommendations, risk alerts, and phased adjustment plans for personal health management.

## Features

### 1. SMART Goal Validation

Validate whether a newly defined goal follows the SMART principles.

**Validation dimensions**:
- **S**pecific
  - Is the goal clear and concrete
  - Is there a precise definition
  - Does it avoid vague wording

- **M**easurable
  - Are there quantifiable metrics
  - Are there explicit measurement criteria
  - Can progress be tracked

- **A**chievable
  - Is the goal realistic and feasible
  - Does it account for the current situation
  - Is it within a reasonable time frame
  - Weight-loss goal: recommend 0.5-1 kg per week
  - Exercise goal: recommend 3-5 times per week, 30-60 minutes each

- **R**elevant
  - Is the goal health-related
  - Does it align with the user's overall health plan
  - Is it consistent with existing goals

- **T**ime-bound
  - Is there a clear deadline
  - Is the time frame reasonable
  - Are there phased milestones

**Output**:
- SMART scores (1-5 points per dimension)
- Overall score and grade (S/A/B/C)
- Improvement suggestions
- Goal optimization plan

**Example assessment**:
```json
{
  "goal": "Lose 5 kg within 6 months",
  "smart_scores": {
    "specific": 5,
    "measurable": 5,
    "achievable": 4,
    "relevant": 5,
    "time_bound": 5
  },
  "overall_score": 4.8,
  "grade": "A",
  "assessment": "Excellent SMART goal",
  "suggestions": [
    "Set phased milestones (lose 1.5-2 kg every 2 months)",
    "Pair this with an exercise plan and dietary adjustments"
  ]
}
```

---

### 2. Goal Progress Tracking

Track and analyze how a goal is progressing toward completion.

**Tracked items**:
- **Current progress**
  - Completion percentage
  - Current value vs. target value
  - Remaining gap

- **Time progress**
  - Share of time elapsed
  - Time remaining
  - Ahead-of / behind-schedule assessment

- **Pace analysis**
  - Average progress rate (per week / per month)
  - Estimated completion time
  - Whether the plan needs adjustment

- **Trend detection**
  - Progress trend (accelerating / steady / slowing)
  - Cyclical patterns
  - Anomalous fluctuation detection

**Output**:
- Progress visualization (progress bar, percentage)
- Completion probability prediction
- Time estimates (optimistic / neutral / pessimistic)
- Adjustment suggestions

**Progress rating**:
- 🟢 **Excellent** - Ahead of schedule, expected to finish early
- 🟡 **On track** - Progress matches expectations
- 🟠 **Behind** - Slightly slow, needs to speed up
- 🔴 **Severely behind** - Significantly lagging, recommend adjusting the goal

---

### 3. Habit Formation Analysis

Analyze how well a habit is forming and its consistency.

**Analysis items**:
- **Streak tracking**
  - Current streak
  - Longest historical streak
  - Average streak length

- **Completion rate statistics**
  - Overall completion rate
  - Weekly completion rate
  - Monthly completion rate
  - Completion rate by specific day of week

- **Habit strength assessment**
  - Degree of habit entrenchment (1-10 points)
  - Habit stability score
  - Degree of automaticity

- **Habit pattern recognition**
  - Best trigger times
  - Common reasons for interruption
  - Identification of success factors

**Habit formation stages**:
- **Days 1-7** - Initiation phase (easiest to quit)
- **Days 8-21** - Forming phase (gradually stabilizing)
- **Days 22-30** - Consolidation phase (approaching automaticity)
- **Days 31-66** - Habit phase (largely formed)
- **Day 67+** - Automatic phase (fully automated)

**Output**:
- Habit heatmap (calendar view)
- Streak statistics
- Completion rate trend chart
- Habit strength score
- Habit stacking suggestions

**Example analysis**:
```json
{
  "habit": "morning-stretch",
  "current_streak": 21,
  "longest_streak": 21,
  "completion_rate": 95.2,
  "strength_score": 7.5,
  "stage": "Consolidation phase",
  "assessment": "Habit is about to form, keep it up!",
  "next_milestone": 30,
  "suggestions": [
    "Keep going, you are about to reach the 30-day milestone",
    "Consider adding a new related habit"
  ]
}
```

---

### 4. Motivation Assessment and Management

Assess and manage the user's motivation level.

**Assessment items**:
- **Motivation score tracking**
  - Current motivation level (1-10 points)
  - Motivation change trend
  - Motivation fluctuation cycle

- **Motivation factor analysis**
  - Intrinsic motivation (health, self-actualization)
  - Extrinsic motivation (rewards, recognition)
  - Social support (encouragement from family and friends)

- **Motivation dip detection**
  - Signals of declining motivation
  - Common low points in time
  - Risk-period warnings

**Motivation-boosting strategies**:
- **Weeks 2-3** - Motivation drops; emphasize the progress already made
- **Months 1-2** - Fatigue phase; adjust goals and rewards
- **After 3 months** - Burnout phase; introduce novelty and new challenges

**Output**:
- Motivation trend chart
- Motivation dip warnings
- Personalized incentive suggestions
- Reward mechanism suggestions

**Incentive suggestion examples**:
- When motivation < 5: revisit the original intent and lower short-term goals
- When motivation 5-7: emphasize progress and set small rewards
- When motivation > 7: set challenges and pursue excellence

---

### 5. Achievement System Management

Manage the unlocking and progress of a basic achievement system.

**Achievement types**:
- **Goal-related achievements**
  - 🏆 First Goal - Complete your first health goal
  - 🎯 Halfway There - Reach 50% on any goal
  - 🎉 Goal Achieved - Complete a health goal
  - ⚡ Finished Early - Complete a goal ahead of schedule
  - 📈 Exceeded Target - Surpass a goal

- **Habit-related achievements**
  - 🔥 7-Day Streak - 7 consecutive check-ins on any habit
  - 💪 21-Day Streak - 21 consecutive check-ins on any habit
  - ⭐ 30-Day Streak - 30 consecutive check-ins on any habit
  - 🌟 66-Day Streak - 66 consecutive check-ins on any habit (fully formed)

- **Composite achievements**
  - 🏅 Multi-Goal Runner - Complete 3 goals simultaneously
  - 💎 Perfect Commitment - 100% completion rate for a habit over 30 days
  - 🚀 Rapid Progress - Largest progress in a single week
  - 👑 Long-Term Commitment - Track continuously for 180 days

**Achievement tracking**:
- List of unlocked achievements
- Progress toward unearned achievements
- Achievement unlock times
- Achievement-related suggestions

**Output**:
- Achievement badge display
- Achievement completion progress
- Next unlockable achievement
- Achievement attainment suggestions

---

### 6. Obstacle Identification and Recommendations

Identify factors blocking goal attainment and provide solutions.

**Obstacle types**:
- **Time obstacles**
  - Busy schedule, insufficient time
  - Suggestion: shorten each session and increase frequency; use fragmented time

- **Motivation obstacles**
  - Lack of drive, procrastination
  - Suggestion: set reminders; find an accountability partner; adjust the goal

- **Environmental obstacles**
  - Lack of support, too many temptations
  - Suggestion: change the environment; find alternatives; build a support system

- **Capability obstacles**
  - Goal too difficult, lack of knowledge
  - Suggestion: lower the difficulty; learn the relevant knowledge; seek professional help

- **Physical obstacles**
  - Fatigue, discomfort, injury
  - Suggestion: rest and recover; adjust the plan; consult a doctor

**Output**:
- Identification of the main obstacles
- Obstacle frequency statistics
- Personalized solutions
- Preventive suggestions

---

### 7. Data Correlation Analysis

Correlate health goals with other health data.

**Correlation dimensions**:
- **Weight-loss goal correlations**
  - Nutrient intake (calories, macronutrients)
  - Exercise expenditure (frequency, intensity, duration)
  - Sleep quality (duration, depth)
  - Weight change trend

- **Exercise goal correlations**
  - Sleep quality (recovery)
  - Nutrient intake (protein, carbohydrates)
  - Body metrics (weight, body fat percentage)

- **Diet goal correlations**
  - Nutrient intake (vitamins, minerals)
  - Body metrics (blood pressure, blood sugar)
  - Exercise performance

- **Sleep goal correlations**
  - Exercise timing (impact of late-evening exercise)
  - Meal timing (dinner time, caffeine)
  - Screen time (blue-light impact)

**Analysis methods**:
- Correlation analysis (Pearson correlation coefficient)
- Regression analysis (predictive models)
- Trend matching (trend synchronicity)
- Causal inference (potential causal relationships)

**Output**:
- Correlation strength (strong / moderate / weak)
- Positive / negative correlation
- Causal relationship inference
- Optimization suggestions

**Example correlation**:
```json
{
  "goal": "weight-loss",
  "correlations": [
    {
      "factor": "daily_calories",
      "correlation": -0.75,
      "strength": "Strong negative correlation",
      "insight": "Daily calorie intake is strongly negatively correlated with weight-loss progress; reducing intake speeds up progress"
    },
    {
      "factor": "exercise_frequency",
      "correlation": 0.68,
      "strength": "Strong positive correlation",
      "insight": "Exercise frequency is strongly positively correlated with weight-loss progress; aim for at least 4 sessions per week"
    },
    {
      "factor": "sleep_duration",
      "correlation": 0.45,
      "strength": "Moderate positive correlation",
      "insight": "Sleep duration affects weight loss; aim for 7-8 hours of sleep"
    }
  ],
  "recommendations": [
    "Focus on controlling calorie intake and maintain the current exercise frequency",
    "Optimize sleep duration to improve weight-loss results"
  ]
}
```

---

### 8. Visualization Report Generation

Generate an interactive HTML report with ECharts charts.

**Report types**:

#### A. Progress Trend Report
- Line chart showing goal progress over time
- Milestone annotations
- Predicted completion time range
- Progress pace analysis

#### B. Habit Heatmap Report
- Calendar heatmap showing habit completion
- Color intensity indicating completion frequency
- Streak annotations
- Completion rate statistics

#### C. Multi-Goal Comparison Report
- Ring (donut) chart showing completion rates of multiple goals
- Priority ranking
- Resource allocation suggestions
- Progress synchronicity analysis

#### D. Motivation Trend Report
- Line chart showing motivation changes
- Correlation between motivation and progress
- Motivation dip warnings
- Incentive suggestions

#### E. Comprehensive Report
- Includes all of the charts above
- Overall health status assessment
- Comprehensive improvement suggestions
- Next-phase goal suggestions

**Report features**:
- Responsive design, mobile-friendly
- Dark / light theme switching
- Interactive charts (zoom, filter)
- Data table display
- PDF export
- Fully localized, no internet connection required

**ECharts chart configuration**:
```javascript
// Progress trend line chart
{
  type: 'line',
  xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', ...] },
  yAxis: { type: 'value', name: 'Completion %' },
  series: [{
    name: 'Goal progress',
    type: 'line',
    data: [0, 15, 35, 50, 70, 85, 100],
    smooth: true,
    markLine: {
      data: [{ yAxis: 50, name: '50% milestone' }]
    }
  }]
}

// Habit heatmap
{
  type: 'heatmap',
  xAxis: { type: 'category', data: ['Mon', 'Tue', ...] },
  yAxis: { type: 'category', data: ['Week 1', 'Week 2', ...] },
  visualMap: {
    min: 0, max: 1,
    inRange: { color: ['#ebedf0', '#216e39'] }
  },
  series: [{
    type: 'heatmap',
    data: [[0, 0, 1], [1, 0, 1], [2, 0, 0], ...]
  }]
}

// Goal completion ring chart
{
  type: 'pie',
  radius: ['50%', '70%'],
  series: [{
    type: 'pie',
    radius: ['50%', '70%'],
    data: [
      { value: 70, name: 'Completed' },
      { value: 30, name: 'Remaining' }
    ],
    label: { formatter: '{b}: {c}%' }
  }]
}
```

**Output**:
- HTML file (with complete CSS, JS, and ECharts)
- Chart interactivity
- Data tables
- Analysis text
- List of recommendations

---

## Medical Safety Boundaries

### Scope of Capability Statement
- ✅ Assist in setting health goals
- ✅ Track and analyze goal progress
- ✅ Identify health-behavior patterns
- ✅ Provide general health-improvement advice
- ✅ Generate visualization reports

- ❌ Does not provide medical diagnoses
- ❌ Does not issue treatment prescriptions
- ❌ Does not replace professional medical advice
- ❌ Does not address eating disorders or compulsive behaviors

### Danger Signal Detection
**Extreme goal warnings**:
- Weight-loss goal > 1 kg per week
- Weight-gain goal > 0.5 kg per week
- Extreme calorie restriction (< 1200 kcal/day)
- Excessive exercise (> 2 hours/day, 7 days/week)

**Signs of unhealthy behavior**:
- Completion rate < 30% for 3 consecutive weeks
- Motivation score < 3 for 2 consecutive weeks
- Reports of physical discomfort
- Compulsive behavior patterns

**Referral recommendations**:
- When danger signals appear, recommend consulting a doctor
- For chronic conditions, recommend consulting the relevant specialist
- When setting diet goals, recommend consulting a nutritionist
- When setting exercise goals, recommend consulting a fitness trainer

---

## Output Format

### Goal Analysis Report
```markdown
# Health Goal Analysis Report

## Goal Overview
- Goal: Lose 5 kg within 6 months
- Start date: 2025-01-01
- Target date: 2025-06-30
- Current date: 2025-03-20

## SMART Assessment
- Specific: ⭐⭐⭐⭐⭐ (5/5)
- Measurable: ⭐⭐⭐⭐⭐ (5/5)
- Achievable: ⭐⭐⭐⭐ (4/5)
- Relevant: ⭐⭐⭐⭐⭐ (5/5)
- Time-bound: ⭐⭐⭐⭐⭐ (5/5)

**Overall score: A (4.8/5)**

## Progress Analysis
- Current progress: 70%
- Completed: 3.5 kg / 5.0 kg
- Time progress: 27% (79 days / 180 days)
- Progress rating: 🟢 Excellent (ahead of schedule)

### Trend Analysis
- Average pace: 0.77 kg/month
- Estimated completion: 2025-05-20 (40 days early)
- Progress trend: Steadily rising

## Habit Tracking
### Morning Stretch Habit
- Current streak: 21 days 🔥
- Longest streak: 21 days
- Completion rate: 95.2%
- Habit stage: Consolidation phase
- Next milestone: 30 days ⭐

## Motivation Assessment
- Current motivation: 8/10
- Motivation trend: Steady
- Motivation status: Good

## Data Correlation Analysis
### Strongly correlated factors (impact > 60%)
1. Daily calorie intake (negative correlation -0.75)
2. Weekly exercise frequency (positive correlation +0.68)
3. Sleep duration (positive correlation +0.45)

### Recommendations
- Maintain the current calorie intake level
- Keep up the 4 exercise sessions per week
- Optimize sleep duration to 7-8 hours

## Obstacle Identification
Main obstacle: Diet control during social events

Solutions:
- Plan meals in advance before social events
- Choose healthy restaurants
- Keep portions moderate

## Achievement Unlocks
🔥 21-Day Streak - Morning stretch habit achieved!
🎯 Halfway There - Weight-loss goal 50% complete!

## Next Actions
1. Maintain the current pace
2. Pay attention to diet control during social events
3. Continue building the morning workout habit
4. Prepare to hit the 30-day milestone
```

---

## Technical Implementation Notes

### Data Reading
- Read the main data file: `data-example/health-goals-tracker.json`
- Read log files: `data-example/health-goals-logs/YYYY-MM/YYYY-MM-DD.json`
- Correlated data: `data-example/nutrition-tracker.json`, `fitness-tracker.json`, etc.

### Data Processing
- Compute completion percentage: `(current_value / target_value) * 100`
- Compute time progress: `(days_elapsed / total_days) * 100`
- Compute streak: iterate over logs and count consecutive completed days
- Compute completion rate: `(completed_days / total_days) * 100`
- Compute habit strength: composite score based on completion rate and streak length

### SMART Validation Algorithm
```python
def validate_smart_goal(goal):
    scores = {
        'specific': check_specificity(goal),
        'measurable': check_measurability(goal),
        'achievable': check_achievability(goal),
        'relevant': check_relevance(goal),
        'time_bound': check_time_bound(goal)
    }
    overall = sum(scores.values()) / len(scores)
    grade = get_grade(overall)
    return scores, overall, grade
```

### HTML Report Generation
- Use the ECharts 5.x CDN
- Responsive CSS layout
- JavaScript handles chart interactions
- Support dark / light theme switching
- Data is loaded dynamically from JSON files

---

**When using this skill, always prioritize the user's health and safety!**

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
