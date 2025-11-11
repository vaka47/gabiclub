from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0002_articletag_alter_article_options_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="ArticleGalleryImage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("image", models.ImageField(upload_to="articles/gallery/", verbose_name="Фото")),
                ("caption", models.CharField(blank=True, max_length=200, verbose_name="Подпись")),
                ("order", models.PositiveIntegerField(default=0, verbose_name="Порядок")),
                (
                    "article",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="gallery", to="blog.article"),
                ),
            ],
            options={
                "verbose_name": "Фото статьи",
                "verbose_name_plural": "Галерея статьи",
                "ordering": ["order", "id"],
            },
        ),
    ]

