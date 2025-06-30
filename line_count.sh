count_tsx=$(( find -name "*.tsx" -not -path "*/node_modules/*" -print0 | xargs -0 cat ) | wc -l)
count_ts=$(( find -name "*.ts" -not -path "*/node_modules/*" -print0 | xargs -0 cat ) | wc -l)

total=$(( $count_tsx + $count_ts ))

echo "total: $total"

