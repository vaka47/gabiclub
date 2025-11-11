from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("trainings", "0006_trainingplan_add_fields"),
    ]

    operations = [
        migrations.AlterField(
            model_name="trainingplan",
            name="category",
            field=models.CharField(
                "Категория",
                max_length=32,
                choices=[
                    ("personal", "Индивидуальные outdoor"),
                    ("mini_group", "Мини-группы"),
                    ("athlete", "Группы для спортсменов"),
                    ("kids", "Группы для детей"),
                ],
                blank=True,
            ),
        ),
    ]

