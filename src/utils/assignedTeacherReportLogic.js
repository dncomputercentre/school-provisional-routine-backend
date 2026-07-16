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

        const dayNames = [

            "Sunday",

            "Monday",

            "Tuesday",

            "Wednesday",

            "Thursday",

            "Friday",

            "Saturday",

        ];

        const day =
            dayNames[
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

        const end =
            new Date(current);

        end.setHours(
            23,
            59,
            59,
            999
        );

        // ======================================
        // ======================================
        // Load Normal Routine
        // ======================================

        const routines =
            await prisma.classRoutine.findMany({

                where: {
                    day,
                },

                include: {
                    teacher: true,
                },

                orderBy: {
                    time: "asc",
                },

            });

        // ======================================
        // Load Absent Teacher
        // ======================================

        const absentTeachers =
            await prisma.schoolTeacherAbsent.findMany({

                where: {

                    date: {

                        gte: start,

                        lte: end,

                    },

                },

            });

        // ======================================
        // Load All Teachers
        // ======================================

        const teachers =
            await prisma.schoolTeacher.findMany({

                orderBy: {

                    name: "asc",

                },

            });

        const absentIds =
            absentTeachers.map(
                (item) => item.teacherId
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

            if (
                !teacherMap[teacher.teacherId]
            ) {

                teacherMap[
                    teacher.teacherId
                ] = createTeacherObject(

                    teacher.teacherId,

                    teacher.teacherName

                );

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

                        teacherMap[
                        teacher.teacherId
                        ],

                        start
                            .toISOString()
                            .slice(0, 10),

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
