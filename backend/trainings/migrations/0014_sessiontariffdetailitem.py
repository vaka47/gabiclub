import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("trainings", "0013_alter_sessiontariffphoto_options_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="SessionTariffDetailItem",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("subtitle", models.CharField(max_length=180, verbose_name="Подзаголовок")),
                ("description", models.TextField(blank=True, verbose_name="Пояснение")),
                ("order", models.PositiveIntegerField(default=0, verbose_name="Порядок")),
                (
                    "tariff",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="detail_items",
                        to="trainings.sessiontariff",
                    ),
                ),
            ],
            options={
                "verbose_name": "Пункт под описанием тарифа занятия",
                "verbose_name_plural": "Пункты под описанием тарифов занятий",
                "ordering": ["order", "id"],
            },
        ),
    ]
