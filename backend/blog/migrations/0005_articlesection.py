from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0004_article_header_image"),
    ]

    operations = [
        migrations.CreateModel(
            name="ArticleSection",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(blank=True, max_length=160, verbose_name="Подзаголовок")),
                ("content", models.TextField(blank=True, verbose_name="Текст абзаца")),
                ("order", models.PositiveIntegerField(default=0, verbose_name="Порядок")),
                (
                    "article",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="sections", to="blog.article"),
                ),
            ],
            options={
                "verbose_name": "Абзац статьи",
                "verbose_name_plural": "Абзацы статьи",
                "ordering": ["order", "id"],
            },
        ),
    ]

