"""URL routes for the /teacher/ portal."""

from django.urls import path

from . import teacher_views


urlpatterns = [
    path('login/', teacher_views.teacher_login, name='teacher_login'),
    path('logout/', teacher_views.teacher_logout, name='teacher_logout'),
    path('', teacher_views.teacher_portal, name='teacher_portal'),
    path('reports/', teacher_views.teacher_reports_index, name='teacher_reports'),
    path('reports/all/', teacher_views.teacher_quiz_report_all_pdf, name='teacher_quiz_report_all'),
    path('reports/student/<uuid:student_id>/', teacher_views.teacher_student_quiz_report_pdf, name='teacher_student_quiz_report'),
    path('student/new/', teacher_views.teacher_student_new, name='teacher_student_new'),
    path('student/<uuid:student_id>/', teacher_views.teacher_student_detail, name='teacher_student_detail'),
    path('student/<uuid:student_id>/edit/', teacher_views.teacher_student_edit, name='teacher_student_edit'),
    path('student/<uuid:student_id>/delete/', teacher_views.teacher_student_delete, name='teacher_student_delete'),
    path('student/<uuid:student_id>/reset/', teacher_views.teacher_student_reset_password, name='teacher_student_reset_password'),
    path('student/<uuid:student_id>/toggle-active/', teacher_views.teacher_student_toggle_active, name='teacher_student_toggle_active'),
    path('student/<uuid:student_id>/toggle-verified/', teacher_views.teacher_student_toggle_verified, name='teacher_student_toggle_verified'),
]
