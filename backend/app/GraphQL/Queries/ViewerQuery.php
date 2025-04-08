<?php declare(strict_types=1);

namespace App\GraphQL\Queries;

use Illuminate\Support\Facades\Auth;

final readonly class ViewerQuery
{
    /** @param  array{}  $args */
    public function __invoke(null $_, array $args)
    {
        // TODO implement the resolver
    }

    public function resolve()
    {
        return [
            "user" => Auth::user(),
            "isAuthenticated" => Auth::check(),
        ];
    }
}
