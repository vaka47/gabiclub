from django.db import migrations, models


LEGACY_LEVEL_NAME_MAP = {
    "beginner": "Начальный",
    "intermediate": "Средний",
    "advanced": "Продвинутый",
    "any": "Любой уровень",
}


def rename_legacy_level_tags(apps, schema_editor):
    LevelTag = apps.get_model("trainings", "LevelTag")

    for level in LevelTag.objects.all():
        mapped_name = LEGACY_LEVEL_NAME_MAP.get(level.tag)
        if not mapped_name:
            continue

        if (
            LevelTag.objects.filter(tag=mapped_name)
            .exclude(pk=level.pk)
            .exists()
        ):
            continue

        level.tag = mapped_name
        level.save(update_fields=["tag"])


class Migration(migrations.Migration):

    dependencies = [
        ("trainings", "0008_sessiontariff_sessiontariffprice"),
    ]

    operations = [
        migrations.AlterField(
            model_name="leveltag",
            name="tag",
            field=models.CharField(
                help_text="Например: Начальный, Продвинутый, Любой уровень, PRO.",
                max_length=80,
                unique=True,
                verbose_name="Название уровня",
            ),
        ),
        migrations.RunPython(
            rename_legacy_level_tags,
            migrations.RunPython.noop,
        ),
    ]
