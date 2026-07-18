import {
    buildProvisionalRoutine,
} from "./provisionalRoutineLogic.js";

import {
    buildAssignedTeacherRoutine,
} from "./assignedTeacherRoutineLogic.js";

// ==========================================
// Period Order
// ==========================================

const PERIOD_ORDER = [

    "First",

    "Second",

    "Third",

    "Fourth",

    "Fifth",

    "Sixth",

    "Seventh",

    "Eighth",

];

// ==========================================
// Day Names
// ==========================================

const DAY_NAMES = [

    "Sunday",

    "Monday",

    "Tuesday",

    "Wednesday",

    "Thursday",

    "Friday",

    "Saturday",

];


function createTeacherObject(
    teacherId,
    teacherName
) {

    return {

        teacherId,

        teacherName,

        totalProvisional: 0,

        details: [],

    };

}



function addReportItem(

    teacher,

    date,

    periodData

) {

    teacher.details.push({

        date,

        period:
            periodData.period,

        time:
            periodData.time,

        className:
            periodData.className,

        section:
            periodData.section,

        subject:
            periodData.subject,

    });

    teacher.totalProvisional++;

}


function sortTeacherDetails(
    teacher
) {

    teacher.details.sort(
        (a, b) => {

            if (a.date !== b.date) {

                return (
                    new Date(a.date) -
                    new Date(b.date)
                );

            }

            return (

                PERIOD_ORDER.indexOf(
                    a.period
                ) -

                PERIOD_ORDER.indexOf(
                    b.period
                )

            );

        }
    );

}

// ==========================================
// Main Function
// ==========================================

export async function buildAssignedTeacherReport(

    startDate,

    endDate,

    prisma

) {

    const teacherMap = {};
    // ======================================
    // Load All Teachers (Only Once)
    // ======================================

    const teachers = await prisma.schoolTeacher.findMany({
        orderBy: {
            name: "asc",
        },
    });

    // ======================================
    // Load All Routine (Only Once)
    // ======================================

    const allRoutines = await prisma.classRoutine.findMany({
        include: {
            teacher: true,
        },
        orderBy: {
            time: "asc",
        },
    });

    // ======================================
    // Group Routine By Day
    // ======================================

    const routineMap = {};

    allRoutines.forEach((item) => {

        if (!routineMap[item.day]) {

            routineMap[item.day] = [];

        }

        routineMap[item.day].push(item);

    });

    // ======================================
    // Load All Absent (Only Once)
    // ======================================

    const allAbsentTeachers =
        await prisma.schoolTeacherAbsent.findMany({

            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },

        });
    // ======================================
    // Group Absent Teacher By Date
    // ======================================

    const absentMap = {};

    allAbsentTeachers.forEach((item) => {

        const key = new Date(item.date)
            .toISOString()
            .slice(0, 10);

        if (!absentMap[key]) {

            absentMap[key] = [];

        }

        absentMap[key].push(item);

    });
    // ======================================
    // Clone Date
    // ======================================

    const current =
        new Date(startDate);

    const last =
        new Date(endDate);

    // ======================================
    // Date Loop
    // ======================================

    while (current <= last) {



        const day =
            DAY_NAMES[
            current.getDay()
            ];
        const start =
            new Date(current);

        start.setHours(
            0,
            0,
            0,
            0
        );
        const dateKey = start
            .toISOString()
            .slice(0, 10);

        const end =
            new Date(current);

        end.setHours(
            23,
            59,
            59,
            999
        );

        const routines = routineMap[day] || [];

        // ======================================
        // Load Absent Teacher
        // ======================================

        const absentTeachers =
            absentMap[dateKey] || [];

        // ======================================
        // Load All Teachers
        // ======================================



       const absentIds = new Set(
    absentTeachers.map(
        (item) => item.teacherId
    )
);
        // ======================================
        // Build Provisional Routine
        // ======================================

        const provisionalRoutine =
            buildProvisionalRoutine(

                routines,

                teachers,

                absentIds

            );

        // ======================================
        // Build Assigned Teacher Routine
        // ======================================

        const assignedTeachers =
            buildAssignedTeacherRoutine(

                provisionalRoutine,

                routines

            );

        // ======================================
        // Merge Report
        // ======================================

        assignedTeachers.forEach((teacher) => {

            let reportTeacher =
                teacherMap[teacher.teacherId];

            if (!reportTeacher) {

                reportTeacher =
                    createTeacherObject(
                        teacher.teacherId,
                        teacher.teacherName
                    );

                teacherMap[teacher.teacherId] =
                    reportTeacher;
            }

            Object.values(
                teacher.periods
            )
                .filter(Boolean)
                .forEach((periodData) => {

                    if (
                        periodData.type !==
                        "Provisional"
                    ) {
                        return;
                    }

                    addReportItem(

                        reportTeacher,

                        dateKey,

                        periodData

                    );
                });

        });


        current.setDate(
            current.getDate() + 1
        );

    }

    // ======================================
    // Convert To Array
    // ======================================

    const result =
        Object.values(teacherMap);

    // ======================================
    // Sort Teacher Details
    // ======================================

    result.forEach((teacher) => {

        sortTeacherDetails(
            teacher
        );

    });

    // ======================================
    // Sort Teacher Name
    // ======================================

    result.sort((a, b) => {

        return a.teacherName.localeCompare(
            b.teacherName
        );

    });

    // ======================================
    // Return Result
    // ======================================

    return result;

}
